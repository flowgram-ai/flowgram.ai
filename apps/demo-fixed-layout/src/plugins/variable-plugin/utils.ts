import { get } from 'lodash-es';
import { ASTFactory, type ASTNodeJSON } from '@flowgram.ai/fixed-layout-editor';

import { type JsonSchema } from '../../typings';

function sortProperties(properties: Record<string, JsonSchema>) {
  return Object.entries(properties).sort(
    (a, b) => (get(a?.[1], 'extra.index') || 0) - (get(b?.[1], 'extra.index') || 0)
  );
}

export function createASTFromJSONSchema(jsonSchema: JsonSchema): ASTNodeJSON | undefined {
  const { type } = jsonSchema || {};

  if (!type) {
    return undefined;
  }

  switch (type) {
    case 'object':
      return ASTFactory.createObject({
        properties: sortProperties(jsonSchema.properties || {}).map(([key, _property]) => ({
          key,
          type: createASTFromJSONSchema(_property),
          meta: { description: _property.description },
        })),
      });
    case 'array':
      return ASTFactory.createArray({
        items: createASTFromJSONSchema(jsonSchema.items!),
      });
    case 'string':
      return ASTFactory.createString();
    case 'number':
      return ASTFactory.createNumber();
    case 'boolean':
      return ASTFactory.createBoolean();
    case 'integer':
      return ASTFactory.createInteger();

    default:
      // Camel case to variable-core type
      return;
  }
}
