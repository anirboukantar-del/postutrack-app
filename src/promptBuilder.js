/**
 * Helper to interpolate dynamic variables into the Master Prompts
 */
export function buildPromptWithTemplate(templateStr, variables) {
  if (!templateStr) return "";
  let result = templateStr;
  
  // Replace each variable key like {companyName}
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    const rawVal = variables[key];
    let valStr = "";
    if (rawVal === null || rawVal === undefined) {
      valStr = "";
    } else if (typeof rawVal === 'object') {
      try {
        valStr = JSON.stringify(rawVal, null, 2);
      } catch {
        valStr = String(rawVal);
      }
    } else {
      valStr = String(rawVal);
    }
    result = result.replace(regex, () => valStr);
  });

  return result;
}
