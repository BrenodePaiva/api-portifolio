import * as Yup from 'yup'
import Project from '../models/Project'
import Category from '../models/Category'
import S3Storage from '../../utils/S3Storage'
import { Op } from 'sequelize'

class ProjectController {
  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      description: Yup.string().required(),
      category_id: Yup.number().required(),
      link: Yup.string().required()
    })

    try {
      await schema.validateSync(request.body, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ error: err.errors })
    }

    const { name, description, category_id, link } = request.body
    const { filename: path } = request.file

    await S3Storage.saveFile(path)
    const project = await Project.create({
      name,
      description,
      category_id,
      path,
      link
    })
    return response.status(201).json(project)
  }

  //-----------------------------------------------------------------

  async index(request, response) {
    const { page = 1 } = request.query
    const { cat = 0 } = request.query
    const { search = '' } = request.query
    const { limit = 3 } = request.query
    let lastPage = 1
    let countProject
    let projects

    function checkLastPage(count) {
      if (count !== 0) {
        lastPage = Math.ceil(count / limit)
      } else {
        return response.status(400).json({ error: 'Project not found' })
      }
    }

    if (search !== '') {
      countProject = await Project.count({
        where: {
          name: {
            [Op.iLike]: `%${search}%`
          }
        }
      })
      checkLastPage(countProject)

      projects = await Project.findAll({
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ],
        order: [['id', 'DESC']],
        offset: Number(page * limit - limit),
        limit,

        where: {
          name: {
            [Op.iLike]: `%${search}%`
          }
        }
      })
    } else {
      if (cat != 0) {
        countProject = await Project.count({ where: { category_id: cat } })
        checkLastPage(countProject)

        projects = await Project.findAll({
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name']
            }
          ],
          order: [['id', 'DESC']],
          offset: Number(page * limit - limit),
          limit,

          where: {
            category_id: cat
          }
        })
      } else {
        countProject = await Project.count()
        checkLastPage(countProject)

        projects = await Project.findAll({
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name']
            }
          ],
          order: [['id', 'DESC']],
          offset: Number(page * limit - limit),
          limit
        })
      }
    }

    const pagination = {
      pathPage: '/projects',
      page,
      limit,
      prev_page: page - 1 >= 1 ? page - 1 : false,
      next_page: Number(page) + 1 > lastPage ? false : Number(page) + 1,
      last_page: lastPage,
      category: cat,
      total: countProject
    }

    return response.status(200).json({ projects, pagination })
  }

  //-----------------------------------------------------------------

  async update(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      description: Yup.string().required(),
      category_id: Yup.number().required(),
      link: Yup.string().required()
    })

    try {
      await schema.validateSync(request.body, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ Error: err.errors })
    }

    const { id } = request.params
    const existProj = await Project.findByPk(id)
    if (!existProj) {
      return response.status(404).json({ Error: 'Project not found' })
    }

    const { name, description, category_id, link } = request.body

    if (!request.file) {
      await Project.update(
        {
          name,
          description,
          category_id,
          link
        },
        { where: { id } }
      )
    } else {
      const { filename: path } = request.file
      await S3Storage.deleteFile(existProj.path)
      await Project.update(
        {
          name,
          description,
          category_id,
          path,
          link
        },
        { where: { id } }
      )
      await S3Storage.saveFile(path)
    }
    const project = await Project.findByPk(id)
    return response.status(200).json(project)
  }

  //-----------------------------------------------------------------

  async delete(request, response) {
    const { id } = request.params
    const project = await Project.findByPk(id)
    if (!project) {
      return response.status(404).json({ Error: 'Project not found' })
    }

    await S3Storage.deleteFile(project.path)

    await Project.destroy({ where: { id } })
    return response.status(200).json({ message: 'Project deleted' })
  }
  //-----------------------------------------------------------------
}

export default new ProjectController()
