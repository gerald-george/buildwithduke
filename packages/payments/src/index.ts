export interface DepositRequest { client: string; email: string; amountPence: number }
export interface PaymentAdapter { createDepositLink(input: DepositRequest): Promise<string> }
