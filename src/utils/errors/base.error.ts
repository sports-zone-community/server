export interface ErrorProps {
  functionName: string;
}

export abstract class BaseError extends Error {
  protected constructor(
    public status: number,
    public message: string,
    public props: ErrorProps,
  ) {
    super(message);
  }
}
