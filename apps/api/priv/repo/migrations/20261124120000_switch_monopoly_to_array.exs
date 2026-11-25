defmodule Flirtual.Repo.Migrations.SwitchMonopolyToArray do
  use Ecto.Migration

  def up do
    execute("""
    ALTER TABLE profiles
    ALTER COLUMN monopoly TYPE citext[]
    USING ARRAY_REMOVE(ARRAY[monopoly], NULL)
    """)

    alter table(:profiles) do
      modify(:monopoly, {:array, :citext}, null: false, default: [])
    end
  end

  def down do
    alter table(:profiles) do
      modify(:monopoly, {:array, :citext}, null: true, default: nil)
    end

    execute("""
    ALTER TABLE profiles
    ALTER COLUMN monopoly TYPE citext
    USING CASE WHEN cardinality(monopoly) = 1 THEN monopoly[1] END
    """)
  end
end
