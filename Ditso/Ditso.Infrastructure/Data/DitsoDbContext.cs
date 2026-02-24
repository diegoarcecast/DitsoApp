using Microsoft.EntityFrameworkCore;
using Ditso.Domain.Entities;
using Ditso.Domain.Common;
using FileEntity = Ditso.Domain.Entities.File;

namespace Ditso.Infrastructure.Data;

public class DitsoDbContext : DbContext
{
    public DitsoDbContext(DbContextOptions<DitsoDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<BudgetItem> BudgetItems => Set<BudgetItem>();
    public DbSet<Debt> Debts => Set<Debt>();
    public DbSet<Goal> Goals => Set<Goal>();
    public DbSet<FileEntity> Files => Set<FileEntity>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        
        // Suprimir warning de pending model changes durante migraciones
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Global query filter for soft delete
        modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Category>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Transaction>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Budget>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Debt>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Goal>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<FileEntity>().HasQueryFilter(e => !e.IsDeleted);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(e => e.Email).IsUnique().HasFilter("[IsDeleted] = 0");
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(512);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Role).IsRequired().HasConversion<string>().HasMaxLength(50);
        });

        // RefreshToken configuration
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(512);
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasOne(e => e.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Category configuration
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Icon).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Type).IsRequired().HasConversion<string>().HasMaxLength(50);
            

entity.HasOne(e => e.User)
                .WithMany(u => u.Categories)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Transaction configuration
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).IsRequired().HasColumnType("decimal(18,2)");
            entity.Property(e => e.Type).IsRequired().HasConversion<string>().HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.RowVersion).IsRowVersion();
            entity.Property(e => e.IsExtraIncome).HasDefaultValue(false);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Transactions)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Transactions)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.File)
                .WithMany()
                .HasForeignKey(e => e.FileId)
                .OnDelete(DeleteBehavior.NoAction);

            // Indexes
            entity.HasIndex(e => new { e.UserId, e.Date })
                .HasFilter("[IsDeleted] = 0");
            entity.HasIndex(e => new { e.UserId, e.CategoryId })
                .HasFilter("[IsDeleted] = 0");
        });

        // Budget configuration
        modelBuilder.Entity<Budget>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Period).IsRequired().HasConversion<string>().HasMaxLength(50);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Budgets)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.UserId, e.IsActive })
                .HasFilter("[IsDeleted] = 0");
        });

        // BudgetItem configuration
        modelBuilder.Entity<BudgetItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.LimitAmount).IsRequired().HasColumnType("decimal(18,2)");
            entity.Property(e => e.IsIncome).HasDefaultValue(false);
            entity.Property(e => e.IsSystemCategory).HasDefaultValue(false);

            entity.HasOne(e => e.Budget)
                .WithMany(b => b.Items)
                .HasForeignKey(e => e.BudgetId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.BudgetItems)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Debt configuration
        modelBuilder.Entity<Debt>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.TotalAmount).IsRequired().HasColumnType("decimal(18,2)");
            entity.Property(e => e.PendingBalance).IsRequired().HasColumnType("decimal(18,2)");
            entity.Property(e => e.InterestRate).IsRequired().HasColumnType("decimal(5,2)");
            entity.Property(e => e.MonthlyPayment).IsRequired().HasColumnType("decimal(18,2)");
            entity.Property(e => e.Creditor).IsRequired().HasMaxLength(200);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Debts)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Goal configuration
        modelBuilder.Entity<Goal>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.TargetAmount).IsRequired().HasColumnType("decimal(18,2)");
            entity.Property(e => e.CurrentAmount).IsRequired().HasColumnType("decimal(18,2)");
            entity.Property(e => e.Description).HasMaxLength(500);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Goals)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // File configuration
        modelBuilder.Entity<FileEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);
            entity.Property(e => e.MimeType).IsRequired().HasMaxLength(100);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Files)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed data - Categorías predefinidas
        SeedCategories(modelBuilder);
    }

    private void SeedCategories(ModelBuilder modelBuilder)
    {
        // ── Seed dates must be fixed (no DateTime.UtcNow) to avoid migration drift ──
        var seedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, UserId = null, Name = "Salario",            Icon = "wallet",      Type = Domain.Enums.TransactionType.Income,  CreatedAt = seedDate, UpdatedAt = seedDate },
            new Category { Id = 2, UserId = null, Name = "Extras",             Icon = "gift",        Type = Domain.Enums.TransactionType.Income,  CreatedAt = seedDate, UpdatedAt = seedDate },
            new Category { Id = 3, UserId = null, Name = "Comida",             Icon = "restaurant",  Type = Domain.Enums.TransactionType.Expense, CreatedAt = seedDate, UpdatedAt = seedDate },
            new Category { Id = 4, UserId = null, Name = "Comida Rápida",      Icon = "fast-food",   Type = Domain.Enums.TransactionType.Expense, CreatedAt = seedDate, UpdatedAt = seedDate },
            new Category { Id = 5, UserId = null, Name = "Transporte",         Icon = "car",         Type = Domain.Enums.TransactionType.Expense, CreatedAt = seedDate, UpdatedAt = seedDate },
            new Category { Id = 6, UserId = null, Name = "Entretenimiento",    Icon = "game-controller", Type = Domain.Enums.TransactionType.Expense, CreatedAt = seedDate, UpdatedAt = seedDate },
            new Category { Id = 7, UserId = null, Name = "Servicios",          Icon = "flash",       Type = Domain.Enums.TransactionType.Expense, CreatedAt = seedDate, UpdatedAt = seedDate },
            new Category { Id = 8, UserId = null, Name = "Salud",              Icon = "medical",     Type = Domain.Enums.TransactionType.Expense, CreatedAt = seedDate, UpdatedAt = seedDate },
            // ── Categoría del sistema para ingresos adicionales ──────────────────
            new Category { Id = 9, UserId = null, Name = "Ingresos Adicionales", Icon = "add-circle", Type = Domain.Enums.TransactionType.Income, CreatedAt = seedDate, UpdatedAt = seedDate }
        );
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is BaseEntity && (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            var entity = (BaseEntity)entry.Entity;
            entity.UpdatedAt = DateTime.UtcNow;

            if (entry.State == EntityState.Added)
            {
                entity.CreatedAt = DateTime.UtcNow;
            }
        }
    }
}
