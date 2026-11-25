defmodule Flirtual.Repo.Migrations.AddKinkCategories do
  use Ecto.Migration

  @general "0d0371c7-3b11-4887-83d8-7af1c0a48e0a"
  @general_short "UhHmjX2rUn2WdutME4eyK4"

  def up do
    execute("""
    INSERT INTO attributes (id, type, "order", metadata, created_at, updated_at)
    VALUES ('#{@general}', 'kink-category', 0, NULL, now(), now())
    """)

    execute("""
    UPDATE attributes
    SET metadata = coalesce(metadata, '{}'::jsonb) || '{"category": "#{@general_short}"}'::jsonb,
        updated_at = now()
    WHERE type = 'kink'
    """)
  end

  def down do
    execute("UPDATE attributes SET metadata = metadata - 'category' WHERE type = 'kink'")
    execute("DELETE FROM attributes WHERE id = '#{@general}'")
  end
end
