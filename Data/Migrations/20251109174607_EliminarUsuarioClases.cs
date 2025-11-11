using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace StudyHub.Data.Migrations
{
    /// <inheritdoc />
    public partial class EliminarUsuarioClases : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UsuarioClases");

            migrationBuilder.DeleteData(
                table: "Cursos",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Cursos",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Cursos",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Cursos",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.AddColumn<int>(
                name: "ProfesorId",
                table: "Cursos",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "UsuarioCursos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FechaUnion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Rol = table.Column<string>(type: "text", nullable: false),
                    Estado = table.Column<string>(type: "text", nullable: false, defaultValue: "Aceptado"),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    CursoId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuarioCursos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UsuarioCursos_Cursos_CursoId",
                        column: x => x.CursoId,
                        principalTable: "Cursos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UsuarioCursos_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cursos_ProfesorId",
                table: "Cursos",
                column: "ProfesorId");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioCursos_CursoId",
                table: "UsuarioCursos",
                column: "CursoId");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioCursos_UsuarioId",
                table: "UsuarioCursos",
                column: "UsuarioId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cursos_Usuarios_ProfesorId",
                table: "Cursos",
                column: "ProfesorId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cursos_Usuarios_ProfesorId",
                table: "Cursos");

            migrationBuilder.DropTable(
                name: "UsuarioCursos");

            migrationBuilder.DropIndex(
                name: "IX_Cursos_ProfesorId",
                table: "Cursos");

            migrationBuilder.DropColumn(
                name: "ProfesorId",
                table: "Cursos");

            migrationBuilder.CreateTable(
                name: "UsuarioClases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClaseId = table.Column<int>(type: "integer", nullable: false),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    Estado = table.Column<string>(type: "text", nullable: false, defaultValue: "Aceptado"),
                    FechaUnion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Rol = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuarioClases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UsuarioClases_Clases_ClaseId",
                        column: x => x.ClaseId,
                        principalTable: "Clases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UsuarioClases_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Cursos",
                columns: new[] { "Id", "Activo", "Codigo", "Descripcion", "Nombre" },
                values: new object[,]
                {
                    { 1, true, "MAT101", null, "Matemáticas" },
                    { 2, true, "PRO101", null, "Programación" },
                    { 3, true, "BD101", null, "Bases de Datos" },
                    { 4, true, "IA101", null, "Inteligencia Artificial" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioClases_ClaseId",
                table: "UsuarioClases",
                column: "ClaseId");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioClases_UsuarioId",
                table: "UsuarioClases",
                column: "UsuarioId");
        }
    }
}
