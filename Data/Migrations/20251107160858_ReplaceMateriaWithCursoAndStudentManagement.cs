using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace StudyHub.Data.Migrations
{
    public partial class ReplaceMateriaWithCursoAndStudentManagement : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1) Crear tabla Cursos y seed
            migrationBuilder.CreateTable(
                name: "Cursos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Codigo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cursos", x => x.Id);
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

            // 2) Agregar CursoId a Clases con valor por defecto 1
            migrationBuilder.AddColumn<int>(
                name: "CursoId",
                table: "Clases",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateIndex(
                name: "IX_Clases_CursoId",
                table: "Clases",
                column: "CursoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Clases_Cursos_CursoId",
                table: "Clases",
                column: "CursoId",
                principalTable: "Cursos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // 3) Estado en UsuarioClases
            migrationBuilder.AddColumn<string>(
                name: "Estado",
                table: "UsuarioClases",
                type: "text",
                nullable: false,
                defaultValue: "Aceptado");

            // 4) Eliminar Materia si existe
            migrationBuilder.Sql(@"DO $$ BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='Clases' AND column_name='Materia') THEN
                    ALTER TABLE ""Clases"" DROP COLUMN ""Materia"";
                END IF; END $$;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 1) Reponer Materia
            migrationBuilder.AddColumn<string>(
                name: "Materia",
                table: "Clases",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            // 2) Quitar FK/Índice/columna CursoId
            migrationBuilder.DropForeignKey(
                name: "FK_Clases_Cursos_CursoId",
                table: "Clases");

            migrationBuilder.DropIndex(
                name: "IX_Clases_CursoId",
                table: "Clases");

            migrationBuilder.DropColumn(
                name: "CursoId",
                table: "Clases");

            // 3) Quitar tabla Cursos
            migrationBuilder.DropTable(
                name: "Cursos");

            // 4) Quitar Estado en UsuarioClases
            migrationBuilder.DropColumn(
                name: "Estado",
                table: "UsuarioClases");
        }
    }
}
