export const logStartFunction = (functionName: string) => {
  console.log(`Starting function ${functionName}...`);
};

export const logEndFunction = (functionName: string) => {
  console.log(`Finished function ${functionName}`);
};

export const logError = (errorMessage: string, functionName: string) => {
  console.error(`Failure function ${functionName}: ${errorMessage}`);
};