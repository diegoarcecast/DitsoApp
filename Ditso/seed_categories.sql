-- Script para insertar categorías predeterminadas en AkioDB
USE AkioDB;
GO

-- Verificar si ya existen categorías
IF NOT EXISTS (SELECT 1 FROM Categories)
BEGIN
    PRINT 'Insertando categorías predeterminadas...';

    -- Categorías de Ingresos (Income)
    INSERT INTO Categories (Name, Icon, Type, IsCustom, IsDeleted, CreatedAt, UpdatedAt)
    VALUES 
        ('Salario', '💰', 'Income', 0, 0, GETUTCDATE(), GETUTCDATE()),
        ('Freelance', '💼', 'Income', 0, 0, GETUTCDATE(), GETUTCDATE()),
        ('Bonos', '🎁', 'Income', 0, 0, GETUTCDATE(), GETUTCDATE()),
        ('Inversiones', '📈', 'Income', 0, 0, GETUTCDATE(), GETUTCDATE()),
        ('Otros Ingresos', '💵', 'Income', 0, 0, GETUTCDATE(), GETUTCDATE());

    -- Categorías de Gastos (Expense)
    INSERT INTO Categories (Name, Icon, Type, IsCustom, IsDeleted, CreatedAt, UpdatedAt)
    VALUES 
        ('Alimentación', '🍔', 'Expense', 0, 0, GETUTCDATE(), GETUTCDATE()),
        ('Transporte', '🚗', 'Expense', 0, 0, GETUTCDATE(), GETUTCDATE()),
        ('Vivienda', '🏠', 'Expense', 0, 0, GETUTCDATE(), GETUTCDATE()),
        ('Servicios', '💡', 'Expense', 0, 0, GETUTCDATE(), GETUTCDATE()),
        ('Entretenimiento', '🎬', 'Expense', 0, 0, GETUTCDATE(), GETUTCDATE()),
        ('Salud', '⚕️', 'Expense', 0, 0, GETUTCDATE(), GETUTCDATE()),
        ('Educación', '📚', 'Expense', 0, 0, GETUTCDATE(), GETUTCDATE()),
        ('Ropa', '👕', 'Expense', 0, 0, GETUTCDATE(), GETUTCDATE()),
        ('Mascota', '🐶', 'Expense', 0, 0, GETUTCDATE(), GETUTCDATE()),
        ('Otros Gastos', '📝', 'Expense', 0, 0, GETUTCDATE(), GETUTCDATE());

    PRINT 'Categorías insertadas exitosamente!';
    PRINT CONCAT('Total categorías: ', (SELECT COUNT(*) FROM Categories));
END
ELSE
BEGIN
    PRINT CONCAT('Ya existen ', (SELECT COUNT(*) FROM Categories), ' categorías en la base de datos.');
END
GO

-- Verificar resultado
SELECT * FROM Categories ORDER BY Type, Name;
GO
