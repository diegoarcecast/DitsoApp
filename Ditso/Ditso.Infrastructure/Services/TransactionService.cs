using Microsoft.EntityFrameworkCore;
using Ditso.Application.DTOs.Transactions;
using Ditso.Application.Interfaces;
using Ditso.Domain.Entities;
using Ditso.Domain.Enums;
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
                Id           = t.Id,
                CategoryId   = t.CategoryId,
                CategoryName = t.Category.Name,
                CategoryIcon = t.Category.Icon,
                Amount       = t.Amount,
                Type         = t.Type.ToString(),
                Date         = t.Date,
                Description  = t.Description,
                FileId       = t.FileId,
                IsExtraIncome = t.IsExtraIncome,
                CreatedAt    = t.CreatedAt
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

        return MapToDto(transaction);
    }

    public async Task<TransactionDto> CreateAsync(CreateTransactionDto dto, int userId)
    {
        // ── Validar que la categoría pertenece al presupuesto activo ─────────────
        var activeBudget = await _context.Budgets
            .Include(b => b.Items)
            .FirstOrDefaultAsync(b => b.UserId == userId && b.IsActive);

        if (activeBudget == null)
            throw new InvalidOperationException("No existe un presupuesto activo. Crea un presupuesto antes de registrar transacciones.");

        var isValidCategory = activeBudget.Items.Any(i => i.CategoryId == dto.CategoryId);
        if (!isValidCategory)
            throw new InvalidOperationException(
                "La categoría seleccionada no pertenece al presupuesto activo. " +
                "Agrega la categoría desde el módulo Presupuesto → Administrar categorías.");

        var transaction = new Transaction
        {
            UserId        = userId,
            CategoryId    = dto.CategoryId,
            Amount        = dto.Amount,
            Type          = dto.Type,
            Date          = dto.Date,
            Description   = dto.Description,
            IsExtraIncome = dto.IsExtraIncome,
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        await _context.Entry(transaction).Reference(t => t.Category).LoadAsync();

        return MapToDto(transaction);
    }

    public async Task<TransactionDto> UpdateAsync(int id, UpdateTransactionDto dto, int userId)
    {
        var transaction = await _context.Transactions
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (transaction == null)
            throw new InvalidOperationException("Transacción no encontrada");

        if (dto.CategoryId.HasValue)
        {
            // Validar que la nueva categoría pertenece también al presupuesto activo
            var activeBudget = await _context.Budgets
                .Include(b => b.Items)
                .FirstOrDefaultAsync(b => b.UserId == userId && b.IsActive);

            var isValid = activeBudget?.Items.Any(i => i.CategoryId == dto.CategoryId.Value) ?? false;
            if (!isValid)
                throw new InvalidOperationException("La categoría seleccionada no pertenece al presupuesto activo.");

            transaction.CategoryId = dto.CategoryId.Value;
        }

        if (dto.Amount.HasValue)
            transaction.Amount = dto.Amount.Value;

        if (dto.Date.HasValue)
            transaction.Date = dto.Date.Value;

        if (dto.Description != null)
            transaction.Description = dto.Description;

        if (dto.IsExtraIncome.HasValue)
            transaction.IsExtraIncome = dto.IsExtraIncome.Value;

        // -1 = desvincular comprobante; > 0 = vincular nuevo comprobante
        if (dto.FileId.HasValue)
            transaction.FileId = dto.FileId.Value == -1 ? null : dto.FileId.Value;

        await _context.SaveChangesAsync();

        if (dto.CategoryId.HasValue)
            await _context.Entry(transaction).Reference(t => t.Category).LoadAsync();

        return MapToDto(transaction);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var transaction = await _context.Transactions
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (transaction == null)
            return false;

        transaction.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    private static TransactionDto MapToDto(Transaction t) => new()
    {
        Id           = t.Id,
        CategoryId   = t.CategoryId,
        CategoryName = t.Category.Name,
        CategoryIcon = t.Category.Icon,
        Amount       = t.Amount,
        Type         = t.Type.ToString(),
        Date         = t.Date,
        Description  = t.Description,
        FileId       = t.FileId,
        IsExtraIncome = t.IsExtraIncome,
        CreatedAt    = t.CreatedAt
    };
}
