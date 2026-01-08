using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlogContent.Data.Migrations
{
    /// <inheritdoc />
    public partial class notification_subject : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SubjectId",
                table: "Notifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubjectType",
                table: "Notifications",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientUserId_SenderId_Type_SubjectType_SubjectId",
                table: "Notifications",
                columns: new[] { "RecipientUserId", "SenderId", "Type", "SubjectType", "SubjectId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notifications_RecipientUserId_SenderId_Type_SubjectType_SubjectId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "SubjectId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "SubjectType",
                table: "Notifications");
        }
    }
}
