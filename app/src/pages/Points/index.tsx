import React, {useState, useEffect} from 'react'
import {View, StyleSheet, Text, ScrollView, Image, Alert} from 'react-native'
import Constants from 'expo-constants'
import {Feather as Icon } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native-gesture-handler'
import {useNavigation} from '@react-navigation/native'
import MapView, {Marker} from 'react-native-maps'
import {SvgUri} from 'react-native-svg'
import api from '../../services/api'
import * as Location from 'expo-location'

interface Item{
    id:number, 
    title: string, 
    image_url: string
}

interface Point{
    id:number,
    name: string, 
    image: string, 
    latitude: number, 
    longitude: number
}

const Points = () =>{
    const [itens, setItens] = useState<Item[]>([])
    const [selectedItens, setSelectedItens] = useState<number[]>([])
    const navigation = useNavigation()
    const [points, setPoints] = useState<Point[]>([])

    const [initialPosition, setInitialPosition]  = useState<[number, number]>([0,0])

    useEffect(() => {
        async function loadPosition(){
            const {status } = await Location.requestPermissionsAsync()

            if(status !== 'granted'){
                Alert.alert('Opps...','O aplicativo não é capaz de funcionar corretamente sem permissão para uso da sua localização')
                return
            }
            const location = await Location.getCurrentPositionAsync()
            const {latitude, longitude} = location.coords

            setInitialPosition([latitude,longitude])
        }

        loadPosition()
    },[])


    useEffect(() => {
        api.get('itens').then(response => {
            setItens(response.data)
        })
    },[])

    useEffect(() => {
        
        api.get('points', {
            params:{
                city:"Contagem", 
                uf:"MG",
                itens: selectedItens
            }
        }).then(response => {
            console.log('chamou')
            setPoints(response.data)
        })
    }, [selectedItens])


    function handleNavigatieBack(){
        navigation.goBack()
    }

    function handleNavigatieToDetail(id: number){
        navigation.navigate('Detail', {point_id: id})
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

    return (
    <>
        <View style={styles.container}>
            <TouchableOpacity onPress={handleNavigatieBack}>
                <Icon name='arrow-left' size={20} color="#34cb79" />
            </TouchableOpacity>

            <Text style={styles.title}>Bem Vindo!</Text>
            <Text style={styles.description}>encontre no mapa um ponto de coleta.</Text>

            <View style={styles.mapContainer} >
                {initialPosition[0] !== 0 && (
                    <MapView 
                    style={styles.map}
                    initialRegion={{
                        latitude: initialPosition[0],
                        longitude:initialPosition[1], 
                        latitudeDelta: 0.014, 
                        longitudeDelta: 0.014,
                    }}  
                    >
                    {points.map(point =>(
                        <Marker 
                        key={String(point.id)} 
                        style={styles.mapMarker} 
                        coordinate={{
                            latitude: point.latitude,
                            longitude: point.longitude 
                        }}
                        onPress={() => handleNavigatieToDetail(point.id)} >
                            <View style={styles.mapMarkerContainer}>
                                <Image style={styles.mapMarkerImage} source={{uri:point.image}}></Image>
                                <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                            </View>
                        </Marker>
                    ))}    
                    </MapView>
                )}
            </View>
        </View>
        <View style={styles.itemsContainer}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingHorizontal:20}}>
               {itens.map(item =>(
                    <TouchableOpacity 
                    key={String(item.id)} 
                    style={[
                        styles.item,
                        selectedItens.includes(item.id)?styles.selectedItem:{}
                    ]} 
                    onPress={()=>handleSelectedItem(item.id)}> 
                        <SvgUri width={42} height={42} uri={item.image_url}></SvgUri>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                    </TouchableOpacity>
               ))}
            </ScrollView>
        </View>
    </>
    )
}



const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 20 + Constants.statusBarHeight,
    },
  
    title: {
      fontSize: 20,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 4,
      fontFamily: 'Roboto_400Regular',
    },
  
    mapContainer: {
      flex: 1,
      width: '100%',
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 16,
    },
  
    map: {
      width: '100%',
      height: '100%',
    },
  
    mapMarker: {
      width: 90,
      height: 80, 
    },
  
    mapMarkerContainer: {
      width: 90,
      height: 70,
      backgroundColor: '#34CB79',
      flexDirection: 'column',
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'center'
    },
  
    mapMarkerImage: {
      width: 90,
      height: 45,
      resizeMode: 'cover',
    },
  
    mapMarkerTitle: {
      flex: 1,
      fontFamily: 'Roboto_400Regular',
      color: '#FFF',
      fontSize: 13,
      lineHeight: 23,
    },
  
    itemsContainer: {
      flexDirection: 'row',
      marginTop: 16,
      marginBottom: 32,
    },
  
    item: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#eee',
      height: 120,
      width: 120,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'space-between',
  
      textAlign: 'center',
    },
  
    selectedItem: {
      borderColor: '#34CB79',
      borderWidth: 2,
    },
  
    itemTitle: {
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      fontSize: 13,
    },
  });
  

export default Points