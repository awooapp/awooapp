defmodule Flirtual.Repo.Migrations.AddFursonas do
  use Ecto.Migration

  def change do
    alter table(:profiles) do
      add :fursonas, {:array, :text}, null: false, default: []
    end
  end
end
