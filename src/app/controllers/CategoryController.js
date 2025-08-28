import * as Yup from 'yup'
import Category from '../models/Category'

class CategoryController {
  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required()
    })

    try {
      await schema.validateSync(request.body, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ error: err.errors })
    }

    const { name } = request.body

    const catogoryExist = await Category.findOne({ where: { name } })

    if (catogoryExist) {
      return response.status(400).json({ error: 'Category alread exist' })
    }

    await Category.create({
      name
    })

    return response.status(201).json({ name })
  }

  //----------------------------------------------------------------------

  async index(request, response) {
    const categoryList = await Category.findAll()
    return response.status(200).json(categoryList)
  }

  //----------------------------------------------------------------------

  async update(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required()
    })

    try {
      await schema.validateSync(request.body, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ error: err.errors })
    }
    const { id } = request.params
    let category = await Category.findByPk(id)
    if (!category) {
      return response.status(404).json({ error: 'Category not found' })
    }

    const { name } = request.body
    const categoryExist = await Category.findOne({
      where: { name }
    })
    if (categoryExist) {
      return response.status(400).json({ error: 'Category alread exist' })
    }

    await Category.update(
      {
        name
      },
      { where: { id } }
    )
    category = await Category.findByPk(id)
    return response.status(200).json(category)
  }

  //----------------------------------------------------------------------

  async delete(request, response) {
    const { id } = request.params
    const category = await Category.findByPk(id)
    if (!category) {
      return response.status(404).json({ error: 'Category not found' })
    }

    try {
      await category.destroy()
      return response.status(200).json({ message: 'Category deleted' })
    } catch (error) {
      return response.status(400).json({ error })
    }
  }
  //----------------------------------------------------------------------
}

export default new CategoryController()
