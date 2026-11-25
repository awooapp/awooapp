defmodule Flirtual.Repo.Migrations.MergeFinishedProfileStatus do
  use Ecto.Migration

  def up do
    execute("UPDATE users SET status = 'registered' WHERE status = 'onboarded'")
    execute("UPDATE users SET status = 'onboarded' WHERE status = 'finished_profile'")
  end

  def down do
    execute("UPDATE users SET status = 'finished_profile' WHERE status = 'onboarded'")
  end
end
