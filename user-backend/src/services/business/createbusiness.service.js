import { AppError } from "@/src/errors/app.error";
import { Errors } from "@/src/errors/errorCodes";
import BaseService from "@/src/lib/base.service";

export default class CreateBusinessService extends BaseService {
  async run() {
    const {
      businessName,
      logoUrl,
      address,
      city,
      state,
      country,
      zipCode,
      phone,
      taxId,
      website,
      currency,
      taxRate,
      invoicePrefix,
      upiId,
      bankAccountNo,
      bankIfsc,
      bankName,
      tax
    } = this.args;

    const { userId, user } = this.context;

    if (!userId) {
      throw new AppError(Errors.USER_NOT_FOUND);
    }

    if (!businessName) {
      throw new AppError(Errors.BUSINESS_NAME_REQUIRED);
    }

    if (!user) {
      throw new AppError(Errors.USER_NOT_FOUND);
    }

    const business = await this.db.business.create({
      data: {
        userId,
        name: businessName,
        logoUrl,
        address,
        city,
        state,
        country,
        zipCode,
        phone,
        taxId,
        website,
        currency,
        taxRate,
        invoicePrefix,
        upiId,
        bankAccountNo,
        bankIfsc,
        bankName,
        tax,
      },
    });

    return business;
  }
}