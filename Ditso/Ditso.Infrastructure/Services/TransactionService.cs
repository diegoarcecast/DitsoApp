using Microsoft.EntityFrameworkCore;
using Ditso.Application.DTOs.Transactions;
using Ditso.Application.Interfaces;
using Ditso.Domain.Entities;
using Ditso.Infrastructure.Data;

namespace Ditso.Infrastructure.Services;

public class TransactionService : ITransactionService
{
    private readonly DitsoDbContext _context;

    public TransactionService(DitsoDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TransactionDto>> GetAllAsync(int userId, DateTime? from = null, DateTime? to = null)
    {
        var query = _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId);

        if (from.HasValue)
            query = query.Where(t => t.Date >= from.Value);

        if (to.HasValue)
            query = query.Where(t => t.Date <= to.Value);

        var transactions = await query
            .OrderByDescending(t => t.Date)
            .Select(t => new TransactionDto
            {
                Id = t.Id,
                CategoryId = t.CategoryId,
                CategoryName = t.Category.Name,
                Amount = t.Amount,
                Type = t.Type.ToString(),
                Date = t.Date,
                Description = t.Description,
                FileId = t.FileId,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return transactions;
    }

    public async Task<TransactionDto?> GetByIdAsync(int id, int userId)
    {
        var transaction = await _context.Transactions
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (transaction == null)
            return null;

        return new TransactionDto
        {
            Id = transaction.Id,
            CategoryId = transaction.CategoryId,
            CategoryName = transaction.Category.Name,
            Amount = transaction.Amount,
            Type = transaction.Type.ToString(),
            Date = transaction.Date,
            Description = transaction.Description,
            FileId = transaction.FileId,
            CreatedAt = transaction.CreatedAt
        };
    }

    public async Task<TransactionDto> CreateAsync(CreateTransactionDto dto, int userId)
    {
        // Validar que la categoría existe
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists)
        {
            throw new InvalidOperationException("Categoría no encontrada");
        }

        var transaction = new Transaction
        {
            UserId = userId,
            CategoryId = dto.CategoryId,
            Amount = dto.Amount,
            Type = dto.Type,
            Date = dto.Date,
            Description = dto.Description
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        // Reload con categoria para retornar
        await _context.Entry(transaction).Reference(t => t.Category).LoadAsync();

        return new TransactionDto
        {
            Id = transaction.Id,
            CategoryId = transaction.CategoryId,
            CategoryName = transaction.Category.Name,
            Amount = transaction.Amount,
            Type = transaction.Type.ToString(),
            Date = transaction.Date,
            Description = transaction.Description,
            FileId = transaction.FileId,
            CreatedAt = transaction.CreatedAt
        };
    }

    public async Task<TransactionDto> UpdateAsync(int id, UpdateTransactionDto dto, int userId)
    {
        var transaction = await _context.Transactions
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (transaction == null)
        {
            throw new InvalidOperationException("Transacción no encontrada");
        }

        // Actualizar solo campos proporcionados
        if (dto.CategoryId.HasValue)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId.Value);
            if (!categoryExists)
            {
                throw new InvalidOperationException("Categoría no encontrada");
            }
            transaction.CategoryId = dto.CategoryId.Value;
        }

        if (dto.Amount.HasValue)
            transaction.Amount = dto.Amount.Value;

        if (dto.Date.HasValue)
            transaction.Date = dto.Date.Value;

        if (dto.Description != null)
            transaction.Description = dto.Description;

        await _context.SaveChangesAsync();

        // Reload categoria si cambió
        if (dto.CategoryId.HasValue)
        {
            await _context.Entry(transaction).Reference(t => t.Category).LoadAsync();
        }

        return new TransactionDto
        {
            Id = transaction.Id,
            CategoryId = transaction.CategoryId,
            CategoryName = transaction.Category.Name,
            Amount = transaction.Amount,
            Type = transaction.Type.ToString(),
            Date = transaction.Date,
            Description = transaction.Description,
            FileId = transaction.FileId,
            CreatedAt = transaction.CreatedAt
        };
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var transaction = await _context.Transactions
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (transaction == null)
            return false;

        // Soft delete
        transaction.IsDeleted = true;
        await _context.SaveChangesAsync();

        return true;
    }
}
