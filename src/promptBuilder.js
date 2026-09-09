/**
 * Helper to interpolate dynamic variables into the Master Prompts
 */
export function buildPromptWithTemplate(templateStr, variables) {
  if (!templateStr) return "";
  let result = templateStr;
  
  // Replace each variable key like {companyName}
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, variables[key] ?? "");
  });

  return result;
}
