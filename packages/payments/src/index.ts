export interface PaymentInstructionRequest { client: string; email: string; invoiceReference: string }
export interface PaymentAdapter { createBankTransferInstructions(input: PaymentInstructionRequest): Promise<string> }
