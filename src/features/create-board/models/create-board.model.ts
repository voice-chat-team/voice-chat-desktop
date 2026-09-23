import { z } from "zod/v4";

export const CreateBoardSchema = z.object({
  name: z.string().trim().nonempty().max(50),
});

export type CreateBoardSchemaModel = z.infer<typeof CreateBoardSchema>;
