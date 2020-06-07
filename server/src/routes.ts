import express from 'express'
import PointsController from './controllers/PointsController'
import ItensController from './controllers/ItensController'

const routes = express.Router();
const pointsControoler = new PointsController()
const itensControoler = new ItensController()

routes.get('/itens', itensControoler.index)

routes.post('/points', pointsControoler.create)
routes.get('/points', pointsControoler.index)
routes.get('/points/:id', pointsControoler.show)
export default routes