using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ditso.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBidirectionalBudget : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsExtraIncome",
                table: "Transactions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsIncome",
                table: "BudgetItems",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSystemCategory",
                table: "BudgetItems",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "CreatedAt", "Icon", "UpdatedAt" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "game-controller", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "CreatedAt", "Icon", "UpdatedAt" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "flash", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "CreatedAt", "Icon", "IsDeleted", "Name", "Type", "UpdatedAt", "UserId" },
                values: new object[] { 9, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "add-circle", false, "Ingresos Adicionales", "Income", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DropColumn(
                name: "IsExtraIncome",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "IsIncome",
                table: "BudgetItems");

            migrationBuilder.DropColumn(
                name: "IsSystemCategory",
                table: "BudgetItems");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6729), new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6853) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6971), new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6971) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6973), new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6974) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6975), new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6976) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6977), new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6978) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "CreatedAt", "Icon", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6979), "gamepad", new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6980) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "CreatedAt", "Icon", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6982), "lightbulb", new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6982) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6984), new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6984) });
        }
    }
}
