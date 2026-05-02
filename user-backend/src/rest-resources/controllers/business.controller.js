import CreateBusinessService from "@/src/services/business/createbusiness.service"
import { sendResponse } from "../../helpers/response.helpers"


export default class BusinessController {
  static async createBusiness(req, res, next) {
    try {
      const result = await CreateBusinessService.execute(req.body, req.context)
      sendResponse({ req, res, next }, result)
    } catch (error) { next(error) }
  }
}