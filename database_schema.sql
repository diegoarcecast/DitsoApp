IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Users] (
    [Id] int NOT NULL IDENTITY,
    [Email] nvarchar(255) NOT NULL,
    [PasswordHash] nvarchar(512) NOT NULL,
    [FullName] nvarchar(200) NOT NULL,
    [Role] nvarchar(50) NOT NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);

CREATE TABLE [Budgets] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [Period] nvarchar(50) NOT NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NOT NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Budgets] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Budgets_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Categories] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NULL,
    [Name] nvarchar(100) NOT NULL,
    [Icon] nvarchar(50) NOT NULL,
    [Type] nvarchar(50) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Categories] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Categories_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Debts] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [Name] nvarchar(200) NOT NULL,
    [TotalAmount] decimal(18,2) NOT NULL,
    [PendingBalance] decimal(18,2) NOT NULL,
    [InterestRate] decimal(5,2) NOT NULL,
    [MonthlyPayment] decimal(18,2) NOT NULL,
    [NextDueDate] datetime2 NOT NULL,
    [Creditor] nvarchar(200) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Debts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Debts_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Files] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [FileName] nvarchar(255) NOT NULL,
    [FilePath] nvarchar(500) NOT NULL,
    [FileSize] bigint NOT NULL,
    [MimeType] nvarchar(100) NOT NULL,
    [UploadedAt] datetime2 NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Files] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Files_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Goals] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [Name] nvarchar(200) NOT NULL,
    [TargetAmount] decimal(18,2) NOT NULL,
    [CurrentAmount] decimal(18,2) NOT NULL,
    [TargetDate] datetime2 NULL,
    [Description] nvarchar(500) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Goals] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Goals_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [RefreshTokens] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [Token] nvarchar(512) NOT NULL,
    [ExpiresAt] datetime2 NOT NULL,
    [IsRevoked] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_RefreshTokens_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [BudgetItems] (
    [Id] int NOT NULL IDENTITY,
    [BudgetId] int NOT NULL,
    [CategoryId] int NOT NULL,
    [LimitAmount] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_BudgetItems] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_BudgetItems_Budgets_BudgetId] FOREIGN KEY ([BudgetId]) REFERENCES [Budgets] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_BudgetItems_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id])
);

CREATE TABLE [Transactions] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [CategoryId] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Type] nvarchar(50) NOT NULL,
    [Date] datetime2 NOT NULL,
    [Description] nvarchar(500) NULL,
    [FileId] int NULL,
    [RowVersion] rowversion NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Transactions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Transactions_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]),
    CONSTRAINT [FK_Transactions_Files_FileId] FOREIGN KEY ([FileId]) REFERENCES [Files] ([Id]),
    CONSTRAINT [FK_Transactions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id])
);

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Icon', N'IsDeleted', N'Name', N'Type', N'UpdatedAt', N'UserId') AND [object_id] = OBJECT_ID(N'[Categories]'))
    SET IDENTITY_INSERT [Categories] ON;
INSERT INTO [Categories] ([Id], [CreatedAt], [Icon], [IsDeleted], [Name], [Type], [UpdatedAt], [UserId])
VALUES (1, '2026-02-04T02:21:33.9763573Z', N'wallet', CAST(0 AS bit), N'Salario', N'Income', '2026-02-04T02:21:33.9763696Z', NULL),
(2, '2026-02-04T02:21:33.9763812Z', N'gift', CAST(0 AS bit), N'Extras', N'Income', '2026-02-04T02:21:33.9763813Z', NULL),
(3, '2026-02-04T02:21:33.9763814Z', N'restaurant', CAST(0 AS bit), N'Comida', N'Expense', '2026-02-04T02:21:33.9763815Z', NULL),
(4, '2026-02-04T02:21:33.9763816Z', N'fast-food', CAST(0 AS bit), N'Comida Rápida', N'Expense', '2026-02-04T02:21:33.9763817Z', NULL),
(5, '2026-02-04T02:21:33.9763818Z', N'car', CAST(0 AS bit), N'Transporte', N'Expense', '2026-02-04T02:21:33.9763819Z', NULL),
(6, '2026-02-04T02:21:33.9763821Z', N'gamepad', CAST(0 AS bit), N'Entretenimiento', N'Expense', '2026-02-04T02:21:33.9763821Z', NULL),
(7, '2026-02-04T02:21:33.9763823Z', N'lightbulb', CAST(0 AS bit), N'Servicios', N'Expense', '2026-02-04T02:21:33.9763823Z', NULL),
(8, '2026-02-04T02:21:33.9763825Z', N'medical', CAST(0 AS bit), N'Salud', N'Expense', '2026-02-04T02:21:33.9763825Z', NULL);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Icon', N'IsDeleted', N'Name', N'Type', N'UpdatedAt', N'UserId') AND [object_id] = OBJECT_ID(N'[Categories]'))
    SET IDENTITY_INSERT [Categories] OFF;

CREATE INDEX [IX_BudgetItems_BudgetId] ON [BudgetItems] ([BudgetId]);

CREATE INDEX [IX_BudgetItems_CategoryId] ON [BudgetItems] ([CategoryId]);

CREATE INDEX [IX_Budgets_UserId_IsActive] ON [Budgets] ([UserId], [IsActive]) WHERE [IsDeleted] = 0;

CREATE INDEX [IX_Categories_UserId] ON [Categories] ([UserId]);

CREATE INDEX [IX_Debts_UserId] ON [Debts] ([UserId]);

CREATE INDEX [IX_Files_UserId] ON [Files] ([UserId]);

CREATE INDEX [IX_Goals_UserId] ON [Goals] ([UserId]);

CREATE UNIQUE INDEX [IX_RefreshTokens_Token] ON [RefreshTokens] ([Token]);

CREATE INDEX [IX_RefreshTokens_UserId] ON [RefreshTokens] ([UserId]);

CREATE INDEX [IX_Transactions_CategoryId] ON [Transactions] ([CategoryId]);

CREATE INDEX [IX_Transactions_FileId] ON [Transactions] ([FileId]);

CREATE INDEX [IX_Transactions_UserId_CategoryId] ON [Transactions] ([UserId], [CategoryId]) WHERE [IsDeleted] = 0;

CREATE INDEX [IX_Transactions_UserId_Date] ON [Transactions] ([UserId], [Date]) WHERE [IsDeleted] = 0;

CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]) WHERE [IsDeleted] = 0;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260204022134_InitialCreate', N'9.0.0');

UPDATE [Categories] SET [CreatedAt] = '2026-02-04T03:21:35.5154109Z', [UpdatedAt] = '2026-02-04T03:21:35.5154240Z'
WHERE [Id] = 1;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2026-02-04T03:21:35.5154373Z', [UpdatedAt] = '2026-02-04T03:21:35.5154374Z'
WHERE [Id] = 2;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2026-02-04T03:21:35.5154376Z', [UpdatedAt] = '2026-02-04T03:21:35.5154376Z'
WHERE [Id] = 3;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2026-02-04T03:21:35.5154378Z', [UpdatedAt] = '2026-02-04T03:21:35.5154379Z'
WHERE [Id] = 4;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2026-02-04T03:21:35.5154381Z', [UpdatedAt] = '2026-02-04T03:21:35.5154381Z'
WHERE [Id] = 5;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2026-02-04T03:21:35.5154384Z', [UpdatedAt] = '2026-02-04T03:21:35.5154384Z'
WHERE [Id] = 6;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2026-02-04T03:21:35.5154386Z', [UpdatedAt] = '2026-02-04T03:21:35.5154387Z'
WHERE [Id] = 7;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2026-02-04T03:21:35.5154389Z', [UpdatedAt] = '2026-02-04T03:21:35.5154389Z'
WHERE [Id] = 8;
SELECT @@ROWCOUNT;


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260204032136_InitialMigration', N'9.0.0');

ALTER TABLE [Budgets] ADD [TotalAmount] decimal(18,2) NOT NULL DEFAULT 0.0;

UPDATE [Categories] SET [CreatedAt] = '2026-02-24T01:42:47.7506729Z', [UpdatedAt] = '2026-02-24T01:42:47.7506853Z'
WHERE [Id] = 1;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2026-02-24T01:42:47.7506971Z', [UpdatedAt] = '2026-02-24T01:42:47.7506971Z'
WHERE [Id] = 2;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2026-02-24T01:42:47.7506973Z', [UpdatedAt] = '2026-02-24T01:42:47.7506974Z'
WHERE [Id] = 3;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2026-02-24T01:42:47.7506975Z', [UpdatedAt] = '2026-02-24T01:42:47.7506976Z'
WHERE [Id] = 4;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2026-02-24T01:42:47.7506977Z', [UpdatedAt] = '2026-02-24T01:42:47.7506978Z'
WHERE [Id] = 5;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2026-02-24T01:42:47.7506979Z', [UpdatedAt] = '2026-02-24T01:42:47.7506980Z'
WHERE [Id] = 6;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2026-02-24T01:42:47.7506982Z', [UpdatedAt] = '2026-02-24T01:42:47.7506982Z'
WHERE [Id] = 7;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2026-02-24T01:42:47.7506984Z', [UpdatedAt] = '2026-02-24T01:42:47.7506984Z'
WHERE [Id] = 8;
SELECT @@ROWCOUNT;


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260224014248_AddBudgetTotalAmount', N'9.0.0');

ALTER TABLE [Transactions] ADD [IsExtraIncome] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [BudgetItems] ADD [IsIncome] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [BudgetItems] ADD [IsSystemCategory] bit NOT NULL DEFAULT CAST(0 AS bit);

UPDATE [Categories] SET [CreatedAt] = '2024-01-01T00:00:00.0000000Z', [UpdatedAt] = '2024-01-01T00:00:00.0000000Z'
WHERE [Id] = 1;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2024-01-01T00:00:00.0000000Z', [UpdatedAt] = '2024-01-01T00:00:00.0000000Z'
WHERE [Id] = 2;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2024-01-01T00:00:00.0000000Z', [UpdatedAt] = '2024-01-01T00:00:00.0000000Z'
WHERE [Id] = 3;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2024-01-01T00:00:00.0000000Z', [UpdatedAt] = '2024-01-01T00:00:00.0000000Z'
WHERE [Id] = 4;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2024-01-01T00:00:00.0000000Z', [UpdatedAt] = '2024-01-01T00:00:00.0000000Z'
WHERE [Id] = 5;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2024-01-01T00:00:00.0000000Z', [Icon] = N'game-controller', [UpdatedAt] = '2024-01-01T00:00:00.0000000Z'
WHERE [Id] = 6;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2024-01-01T00:00:00.0000000Z', [Icon] = N'flash', [UpdatedAt] = '2024-01-01T00:00:00.0000000Z'
WHERE [Id] = 7;
SELECT @@ROWCOUNT;


UPDATE [Categories] SET [CreatedAt] = '2024-01-01T00:00:00.0000000Z', [UpdatedAt] = '2024-01-01T00:00:00.0000000Z'
WHERE [Id] = 8;
SELECT @@ROWCOUNT;


IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Icon', N'IsDeleted', N'Name', N'Type', N'UpdatedAt', N'UserId') AND [object_id] = OBJECT_ID(N'[Categories]'))
    SET IDENTITY_INSERT [Categories] ON;
INSERT INTO [Categories] ([Id], [CreatedAt], [Icon], [IsDeleted], [Name], [Type], [UpdatedAt], [UserId])
VALUES (9, '2024-01-01T00:00:00.0000000Z', N'add-circle', CAST(0 AS bit), N'Ingresos Adicionales', N'Income', '2024-01-01T00:00:00.0000000Z', NULL);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Icon', N'IsDeleted', N'Name', N'Type', N'UpdatedAt', N'UserId') AND [object_id] = OBJECT_ID(N'[Categories]'))
    SET IDENTITY_INSERT [Categories] OFF;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260224021637_AddBidirectionalBudget', N'9.0.0');

ALTER TABLE [Budgets] ADD [Name] nvarchar(max) NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260224200138_AddBudgetName', N'9.0.0');

CREATE TABLE [AuditLogs] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NULL,
    [Action] nvarchar(100) NOT NULL,
    [EntityType] nvarchar(100) NOT NULL,
    [EntityId] int NULL,
    [Details] nvarchar(1000) NULL,
    [Timestamp] datetime2 NOT NULL,
    CONSTRAINT [PK_AuditLogs] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AuditLogs_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE SET NULL
);

CREATE INDEX [IX_AuditLogs_UserId_Timestamp] ON [AuditLogs] ([UserId], [Timestamp]);


                CREATE OR ALTER TRIGGER trg_Transactions_AuditLog
                ON Transactions
                AFTER INSERT
                AS
                BEGIN
                    SET NOCOUNT ON;
                    INSERT INTO AuditLogs (UserId, Action, EntityType, EntityId, Details, Timestamp)
                    SELECT
                        i.UserId,
                        'TransactionCreated',
                        'Transaction',
                        i.Id,
                        CONCAT('Monto: ', CAST(i.Amount AS NVARCHAR(50)),
                               ' | Tipo: ', i.Type,
                               ' | Fecha: ', CONVERT(NVARCHAR(20), i.Date, 23)),
                        GETUTCDATE()
                    FROM inserted i;
                END;
            

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260225033900_AddAuditLogAndTrigger', N'9.0.0');

COMMIT;
GO

