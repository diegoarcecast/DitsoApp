using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ditso.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditLogAndTrigger : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<int>(type: "int", nullable: true),
                    Details = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AuditLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId_Timestamp",
                table: "AuditLogs",
                columns: new[] { "UserId", "Timestamp" });

            // ── Trigger T-SQL: registra automáticamente en AuditLogs cada INSERT en Transactions ──
            migrationBuilder.Sql(@"
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
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Eliminar trigger antes de dropear la tabla que referencia
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS trg_Transactions_AuditLog;");

            migrationBuilder.DropTable(
                name: "AuditLogs");
        }
    }
}
