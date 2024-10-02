import { z } from 'zod';

// Zod schema for a single field in the table
const FieldSchema = z.object({
  name: z.string().min(1, { message: 'Field name is required' }),
  type: z.string().min(1, { message: 'Field type is required' }),
});

// Zod schema for a single relationship
const RelationshipSchema = z.object({
  targetTableId: z
    .string()
    .uuid({ message: 'Target table ID must be a valid UUID' }),
  sourceField: z.string().min(1, { message: 'Source field is required' }),
  targetField: z.string().min(1, { message: 'Target field is required' }),
  relationType: z.enum(
    ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'],
    {
      message: 'Invalid relation type',
    }
  ),
});

// Zod schema for creating a new table
export const CreateTableSchema = z.object({
  name: z.string().min(1, { message: 'Table name is required' }),
  fields: z
    .array(FieldSchema)
    .min(1, { message: 'At least one field is required' }),
  relationships: z
    .object({
      relations: z.array(RelationshipSchema).optional(),
    })
    .optional(),
});

// Zod schema for updating a table
export const UpdateTableSchema = z.object({
  id: z.string().uuid({ message: 'ID must be a valid UUID' }),
  name: z.string().min(1, { message: 'Table name is required' }).optional(),
  fields: z
    .array(FieldSchema)
    .min(1, { message: 'At least one field is required' })
    .optional(),
  relationships: z
    .object({
      relations: z.array(RelationshipSchema).optional(),
    })
    .optional(),
});

export type TUpdateTable = z.infer<typeof UpdateTableSchema>;
