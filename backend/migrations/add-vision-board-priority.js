const { supabase } = require("../common/config/supabase");

async function addVisionBoardPriority() {
  console.log("Adding priority column to vision_board...");

  try {
    // Check whether the column already exists
    const { data: columns, error: checkError } = await supabase
      .from("vision_board")
      .select("priority")
      .limit(1);

    if (!checkError) {
      console.log("✓ priority column already exists.");
      return;
    }

    // Supabase JS cannot execute arbitrary ALTER TABLE SQL through
    // .from(). Therefore, this migration expects an RPC function
    // called exec_sql to exist.
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        ALTER TABLE public.vision_board
        ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 0;
      `,
    });

    if (error) {
      throw error;
    }

    console.log("✓ priority column added successfully.");
  } catch (error) {
    console.error("✗ Failed to add priority column:");
    console.error(error);
    process.exitCode = 1;
  }
}

addVisionBoardPriority();
