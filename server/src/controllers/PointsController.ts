import knex from '../database/connection'
import {Request, Response, json} from 'express'

class PointsController{
async create (request:Request, response:Response){
    console.log(request.body)

    const {
        name, 
        email, 
        whatsapp,
        latitude, 
        longitude, 
        city, 
        uf,
        itens 
    } = request.body

    const trx = await knex.transaction()

    const point = {
        image: 'https://images.unsplash.com/photo-1557224651-e96a58962468?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
        name, 
        email, 
        whatsapp,
        latitude, 
        longitude, 
        city, 
        uf
    }

    const insertedIds = await trx('points').insert(point)

    const points_id = insertedIds[0]
    
    const pointItens = itens.map((itens_id: number) => {
        return{
            itens_id,
            points_id
        }
    })

    await trx('points_itens').insert(pointItens)
    
    await trx.commit()

    return response.json({
        id: points_id,
        ...point
    })

}


async index (request:Request, response:Response){
    const {city, uf, itens} = request.query
    
    console.log(city, uf, itens)

    const parserdItens = String(itens)
        .split(',')
        .map(item => Number(item.trim()))

    const points = await knex('points')
        .join('points_itens', 'points.id','points_itens.points_id')
        .whereIn('points_itens.itens_id', parserdItens)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('points.*')

    const point = await knex('points').first()

    if(!point)
    return response.status(400).json({message:'ponto nao encontrado'})


    return response.json({points})
}
  
async show (request:Request, response:Response){
    const {id} = request.params
    const point = await knex('points').where('id',id).first()

    if(!point)
    return response.status(400).json({message:'ponto nao encontrado'})

    const itens = await knex('itens')
        .join('points_itens', 'itens.id', '=', 'points_itens.itens_id')
        .where('points_itens.points_id' , id)

    return response.json({point, itens})
}

}
export default PointsController