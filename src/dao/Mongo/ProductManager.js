
import productsService from '../../services/productsService.js';
import usersService from '../../services/usersService.js';

import { logger } from '../../utils/logger.js';

const productService = new productsService()
const UsersService = new usersService()


function ManageAnswer(answer) {
  const arrayAnswer = []
  if (answer) {
    const splitString = answer.split("|");
    switch (splitString[0]) {
      case "E01":
        arrayAnswer.push(400)
        arrayAnswer.push(splitString[1])
        return arrayAnswer
        break;
      case "E02":
        arrayAnswer.push(404)
        arrayAnswer.push(splitString[1])
        return arrayAnswer
        break;
      case "SUC":
        arrayAnswer.push(200)
        arrayAnswer.push(splitString[1])
        return arrayAnswer
        break;
      case "ERR":
      default:
        arrayAnswer.push(500)
        arrayAnswer.push(splitString[1])
        return arrayAnswer
        break;
    }
  }
}

export const getProducts = async (req, res) => {
  try {

    let limit = 0;
    let page = 0
    let sort_ = null
    let query = null
    let swWeb = false
    if (req.limit != undefined) {

      swWeb = true
      limit = req.limit;
      page = req.page;
      sort_ = req.sort;
      query = req.query;

    } else {
      console.log("entro en el else de req.limit 0")
      limit = parseInt(req.query.limit, 10) == 0 || req.query.limit == null ? 50 : parseInt(req.query.limit, 10);
      page = parseInt(req.query.page, 10) == 0 || req.query.page == null ? 1 : parseInt(req.query.page, 10);
      sort_ = req.query.sort;
      query = req.query.query;

    }

    const products = await productService.getProductWpaginviaService(limit, page, sort_, query)

    const isString = (value) => typeof value === 'string';
    if (isString(products)) {

      const arrayAnswer = ManageAnswer(products)
      return res.status(arrayAnswer[0]).send({
        status: arrayAnswer[0],
        message: arrayAnswer[1]
      })
    }

    return swWeb ? products : res.send(products);

  } catch (error) {
    logger.error("Error en ProductManager/getProducts: " + error)
    return res.status(500).send({
      status: "500",
      message: `Se ha arrojado una exepcion: error`
    })
  }
}
export const addProduct = async (req, res) => {
  try {

    let swWeb = false
    let newproduct = {}
    if (req.body == undefined) {
      console.log("entro en if es web")
      swWeb = true
      newproduct = req
    } else {
      console.log("entro en if es api")

      newproduct = req.body
    }
    console.log("llamara al servicio")

    const answer = await productService.addProductviaService(newproduct);

    const arrayAnswer = ManageAnswer(answer)
    const anwserObject = {
      status: arrayAnswer[0],
      message: arrayAnswer[1]
    }

    return swWeb ? anwserObject : res.send(anwserObject);

  } catch (error) {
    logger.error("Error en ProductManager/addProduct: " + error)
    return res.send({
      status: "500",
      message: `Se ha arrojado una exepcion: ${error} `
    })
  }
}
export const getProducts_ = async (req, res) => {
  try {

    const products = await productService.getProductNpaginviaService();

    const isString = (value) => typeof value === 'string';

    if (isString(products)) {
      const arrayAnswer = ManageAnswer(products)
      const error = {
        status: arrayAnswer[0],
        message: arrayAnswer[1]
      }
      return error

    }

    return res.send(products);

  } catch (error) {
    logger.error("Error en ProductManager/getProducts_: " + error)
    return res.status(500).send({
      status: "500",
      message: `Se ha arrojado una exepcion: error`
    })
  }
}
export const getProductById = async (req, res) => {
  try {

    const pid = req.params.pid
    const found = await productService.getProductbyIDviaService({ _id: pid });

    const isString = (value) => typeof value === 'string';

    if (isString(found)) {
      const arrayAnswer = ManageAnswer(found)
      const error = {
        status: arrayAnswer[0],
        message: arrayAnswer[1]
      }
      return res.send(error);
    }
    return res.send(found);
  } catch (error) {
    logger.error("Error en ProductManager/getProductById: " + error)
    return res.status(500).send({
      status: "500",
      message: `Se ha arrojado una exepcion: error`
    })
  }
}
export const updateProduct = async (req, res) => {
  try {
    let pid = 0
    let swINtern = false
    let updatedproduct = {}

    if (req.params == undefined) {
      swINtern = true
      pid = req.pid;
      updatedproduct.stock = req.stock;

    } else {
      pid = req.params.pid
      updatedproduct = req.body
    }

    let answer = await productService.updateProductviaService(pid, updatedproduct);
    const arrayAnswer = ManageAnswer(answer)
    return swINtern ? answer : res.status(arrayAnswer[0]).send({
      status: arrayAnswer[0],
      message: arrayAnswer[1]
    })
  } catch (error) {
    logger.error("Error en ProductManager/updateProduct: " + error)

    return res.status(500).send({
      status: "500",
      message: `Se ha arrojado una exepcion: error`
    })
  }
}
export const deleteProduct = async (req, res) => {
  let swWeb = false
  try {
    console.log("entro en deleteproduct")
    let pid = 0
    let uid = 0


    if (req.params == undefined) {
      console.log("entro en primero")
      swWeb = true

      pid = req.pid
      uid = req.uid
    } else {
      console.log("entro en segundo")

      pid = req.params.pid
    }
    var swSuccess = await UsersService.verifyProductPermission(uid, pid)

    console.log("salio del middleware valor: " + swSuccess)

    if (!swSuccess) {

      return swWeb ? swSuccess : res.status(arrayAnswer[0]).send({
        status: arrayAnswer[0],
        message: arrayAnswer[1]
      })
    }

    let answer = await productService.deletProductviaService({ _id: pid });
    const arrayAnswer = ManageAnswer(answer)
    return swWeb ? swSuccess : res.status(arrayAnswer[0]).send({
      status: arrayAnswer[0],
      message: arrayAnswer[1]
    })
  }
  catch (error) {
    logger.error("Error en ProductManager/deleteProduct: " + error)
    return swWeb ? `ERR|Error generico. Descripcion :${error}` : res.status(500).send({
      status: "500",
      message: `Se ha arrojado una exepcion: error`
    })
  }
}





