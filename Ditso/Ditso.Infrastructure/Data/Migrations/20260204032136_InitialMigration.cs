using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ditso.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 4, 2, 21, 33, 976, DateTimeKind.Utc).AddTicks(3573), new DateTime(2026, 2, 4, 2, 21, 33, 976, DateTimeKind.Utc).AddTicks(3696) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 4, 2, 21, 33, 976, DateTimeKind.Utc).AddTicks(3812), new DateTime(2026, 2, 4, 2, 21, 33, 976, DateTimeKind.Utc).AddTicks(3813) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 4, 2, 21, 33, 976, DateTimeKind.Utc).AddTicks(3814), new DateTime(2026, 2, 4, 2, 21, 33, 976, DateTimeKind.Utc).AddTicks(3815) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 4, 2, 21, 33, 976, DateTimeKind.Utc).AddTicks(3816), new DateTime(2026, 2, 4, 2, 21, 33, 976, DateTimeKind.Utc).AddTicks(3817) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 4, 2, 21, 33, 976, DateTimeKind.Utc).AddTicks(3818), new DateTime(2026, 2, 4, 2, 21, 33, 976, DateTimeKind.Utc).AddTicks(3819) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 4, 2, 21, 33, 976, DateTimeKind.Utc).AddTicks(3821), new DateTime(2026, 2, 4, 2, 21, 33, 976, DateTimeKind.Utc).AddTicks(3821) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 4, 2, 21, 33, 976, DateTimeKind.Utc).AddTicks(3823), new DateTime(2026, 2, 4, 2, 21, 33, 976, DateTimeKind.Utc).AddTicks(3823) });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 2, 4, 2, 21, 33, 976, DateTimeKind.Utc).AddTicks(3825), new DateTime(2026, 2, 4, 2, 21, 33, 976, DateTimeKind.Utc).AddTicks(3825) });
        }
    }
}
