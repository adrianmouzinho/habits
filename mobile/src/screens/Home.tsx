import { Text, View, ScrollView, Alert } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'

import { generateRangeDatesFromYearStart } from '../utils/generate-range-between-dates'

import { DAY_SIZE, HabitDay } from '../components/HabitDay'
import { Header } from '../components/Header'
import { useCallback, useState } from 'react'
import { api } from '../lib/axios'
import { Loading } from '../components/Loading'
import dayjs from 'dayjs'

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const datesFromYearStart = generateRangeDatesFromYearStart()
const minimumSummaryDatesSize = 18 * 5
const amountOfDaysToFill = minimumSummaryDatesSize - datesFromYearStart.length

type Summary = {
  id: string;
  date: string;
  amount: number;
  completed: number;
}[]

export function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)

  const { navigate } = useNavigation()

  async function fetchData() {
    try {
      setIsLoading(true)
      const response = await api.get('/summary')
      setSummary(response.data)
    } catch (error) {
      console.log(error)
      Alert.alert('Ops', 'Não foi possível carregar o resumo de hábitos.')
    } finally {
      setIsLoading(false)
    }
  }

  useFocusEffect(useCallback(() => {
    fetchData()
  }, []))

  if (isLoading) {
    return (
      <Loading />
    )
  }
  
  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <Header />

      <View className="flex-row mt-6 mb-2">
        {weekDays.map((weekDay, i) => (
          <Text 
            key={`${weekDay}-${i}`}
            className="text-zinc-400 text-xl font-bold text-center m-1"
            style={{ width: DAY_SIZE, height: DAY_SIZE }}
          >
            {weekDay}
          </Text>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {summary && (
          <View className="flex-row flex-wrap">
            {datesFromYearStart.map(date => {
              const dayWithHabit = summary.find(day => dayjs(date).isSame(day.date, 'day'))

              return (
                <HabitDay  
                  key={date.toISOString()}
                  date={date}
                  amount={dayWithHabit?.amount}
                  completed={dayWithHabit?.completed}
                  onPress={() => navigate('habit', { date: date.toISOString() })}
                />
              )
            })}

            {amountOfDaysToFill > 0 && Array.from({ length: amountOfDaysToFill }).map((_, i) => (
              <View
                key={i}
                className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                style={{ width: DAY_SIZE, height: DAY_SIZE }}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}