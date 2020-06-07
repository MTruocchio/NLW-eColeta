import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react'
import {Map, TileLayer, Marker} from 'react-leaflet'
import {Link, useHistory} from 'react-router-dom' 
import api from '../../services/api'
import axios from 'axios'
import {LeafletMouseEvent} from 'leaflet'

import logo from '../../assets/logo.svg'
import {FiLogIn, FiArrowLeft} from 'react-icons/fi'
import './styles.css'

interface Item{
    id:number;
    title:string;
    image_url:string;
}

interface IbgeUfResponse{
    sigla:string
}

interface IbgeCityResponse{
    nome:string
}

const CreatePoint = () =>{
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])
//estado para array ou objeto deve manualmente informar o tipo. 
    const [itens, setItens] = useState<Item[]>([])
    const [ufs , setUfs] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([]) 
    const [selectedUf, setSelectedUf] = useState('0')
    const [selectedCity, setSelectedCity] = useState('0')
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0])
    const [selectedItens, setSelectedItens] = useState<number[]>([])

    const history = useHistory()

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            console.log(position)
            const {latitude, longitude} = position.coords
            setInitialPosition([latitude,longitude])
        })
    },[])

    useEffect(() => {
        api.get('itens').then( response =>{
            console.log(response)
            setItens(response.data)
        })
    },[])

    useEffect(()=>{
        axios.get<IbgeUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response =>{
            const ufInitials = response.data.map(uf => uf.sigla)
            setUfs(ufInitials)
        })
    },[])

    useEffect(()=>{
        if(selectedUf === '0' )
            return 

        axios.get<IbgeCityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response =>{
            const cityNames = response.data.map(city => city.nome)
            setCities(cityNames)
        })
    },[selectedUf])

    function handleSelectedUf(event:ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value
        setSelectedUf(uf)
    }

    function handleSelectedCity(event:ChangeEvent<HTMLSelectElement>){
        const city = event.target.value
        setSelectedCity(city)
    }

    function handleMapClick(event:LeafletMouseEvent){
        //console.log(event.latlng)
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function handleInputChange(event:ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target
        setFormData({
            ...formData, [name]:value
        })
    }

    function handleSelectedItem(id: number){
        //console.log(`clicou ${id}`)
        const alreadySelected = selectedItens.findIndex(item => item == id)
        if(alreadySelected >= 0){
            const filteredItens = selectedItens.filter(item => item !== id)
            setSelectedItens(filteredItens)
        }
        else
        setSelectedItens([...selectedItens, id])
    }

    async function handleSubmit(event:FormEvent){
        event.preventDefault()
        const {name, email, whatsapp} = formData
        const uf = selectedUf
        const city = selectedCity
        const [latitude, longitude] = selectedPosition
        const itens = selectedItens 

        const data = {
            name, 
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            itens
        }
        console.log(data)

        await api.post('points',data)

        alert('Ponto Cadastrado com sucesso')

        history.push('/')
    }

    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
               
                <Link to='/'> 
                    <FiArrowLeft />
                    Voltar para Home
                </Link>
            </header>
            <form onSubmit={handleSubmit}> 
                <h1>Cadastro do <br />ponto de coleta</h1>
                <fieldset>
                    <legend><h2>Dados</h2></legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatswapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no Mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
                        <TileLayer attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' 
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">UF</label>
                            <select onChange={handleSelectedUf} value={selectedUf} name="uf"id="uf"                            >
                                <option value="0">Selecione um Estado</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>
                                       {uf}
                                    </option>
                                ))}
                            </select>

                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select  name="city"id="city" value={selectedCity} onChange={handleSelectedCity} >
                                <option value="0">Selecione uma Cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>
                                       {city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                </fieldset>

                <fieldset>
                    <legend><h2>Itens de Coleta</h2>
                    <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    
                    <ul className="items-grid">
                    {itens.map(item => (
                        <li 
                        key={item.id} 
                        onClick={() => 
                        handleSelectedItem(item.id)}
                        className={selectedItens.includes(item.id)?'selected':''}
                        >
                            <img src={item.image_url} alt={item.title} />
                            <span>{item.title}</span>
                        </li>
                    ))}
                         
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}
export default CreatePoint 