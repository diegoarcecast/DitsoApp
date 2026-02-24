using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ditso.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBudgetTotalAmount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "TotalAmount",
                table: "Budgets",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

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
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6979), new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6980) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6982), new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6982) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6984), new DateTime(2026, 2, 24, 1, 42, 47, 750, DateTimeKind.Utc).AddTicks(6984) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalAmount",
                table: "Budgets");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 4, 3, 21, 35, 515, DateTimeKind.Utc).AddTicks(4109), new DateTime(2026, 2, 4, 3, 21, 35, 515, DateTimeKind.Utc).AddTicks(4240) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 4, 3, 21, 35, 515, DateTimeKind.Utc).AddTicks(4373), new DateTime(2026, 2, 4, 3, 21, 35, 515, DateTimeKind.Utc).AddTicks(4374) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 4, 3, 21, 35, 515, DateTimeKind.Utc).AddTicks(4376), new DateTime(2026, 2, 4, 3, 21, 35, 515, DateTimeKind.Utc).AddTicks(4376) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 4, 3, 21, 35, 515, DateTimeKind.Utc).AddTicks(4378), new DateTime(2026, 2, 4, 3, 21, 35, 515, DateTimeKind.Utc).AddTicks(4379) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 4, 3, 21, 35, 515, DateTimeKind.Utc).AddTicks(4381), new DateTime(2026, 2, 4, 3, 21, 35, 515, DateTimeKind.Utc).AddTicks(4381) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 4, 3, 21, 35, 515, DateTimeKind.Utc).AddTicks(4384), new DateTime(2026, 2, 4, 3, 21, 35, 515, DateTimeKind.Utc).AddTicks(4384) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 4, 3, 21, 35, 515, DateTimeKind.Utc).AddTicks(4386), new DateTime(2026, 2, 4, 3, 21, 35, 515, DateTimeKind.Utc).AddTicks(4387) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 4, 3, 21, 35, 515, DateTimeKind.Utc).AddTicks(4389), new DateTime(2026, 2, 4, 3, 21, 35, 515, DateTimeKind.Utc).AddTicks(4389) });
        }
    }
}
