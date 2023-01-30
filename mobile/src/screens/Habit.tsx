import { useEffect, useState } from 'react'
import { ScrollView, View, Text, Alert } from 'react-native'
import { useRoute } from '@react-navigation/native'
import dayjs from 'dayjs'

import { BackButton } from '../components/BackButton'
import { ProgressBar } from '../components/ProgressBar'
import { Checkbox } from '../components/Checkbox'
import { Loading } from '../components/Loading'
import { api } from '../lib/axios'
import { generateProgressPercentage } from '../utils/generate-progress-percentage'
import { HabitEmpty } from '../components/HabitsEmpty'
import clsx from 'clsx'

interface Params {
  date: string
}

interface DayInfo {
  completedHabits: string[];
  possibleHabits: {
    id: string
    title: string
  }[]
}

export function Habit() {
  const [isLoading, setIsLoading] = useState(false)
  const [dayInfo, setDayInfo] = useState<DayInfo | null>(null)

  const route = useRoute()
  const { date } = route.params as Params

  const parsedDate = dayjs(date)
  const dayOfWeek = parsedDate.format('dddd')
  const dayAndMonth = parsedDate.format('DD/MM')

  const isDateInPast = parsedDate.endOf('day').isBefore(new Date())

  const habitsProgress = dayInfo?.completedHabits.length ? generateProgressPercentage(dayInfo.possibleHabits.length, dayInfo.completedHabits.length) : 0

  async function fetchHabits() {
    try {
      setIsLoading(true)

      const response = await api.get('/day', { params: date })
      setDayInfo(response.data)
    } catch (error) {
      console.log(error)
      Alert.alert('Ops', 'Não foi possível carregar as informações dos hábitos.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleToggleHabit(habitId: string) {
    try {
      await api.patch(`/habits/${habitId}/toggle`)
  
      const isHabitAlreadyCompleted = dayInfo!.completedHabits.includes(habitId)
  
      let completedHabits: string[] = []
  
      if (isHabitAlreadyCompleted) {
        completedHabits = dayInfo!.completedHabits.filter(id => id !== habitId)
      } else {
        completedHabits = [...dayInfo!.completedHabits, habitId]
      }
  
      setDayInfo({
        possibleHabits: dayInfo!.possibleHabits,
        completedHabits,
      })
    } catch (error) {
      console.log(error)
      Alert.alert('Ops', 'Não foi possível atualizar o status do hábito.')
    }
  }

  useEffect(() => {
    fetchHabits()
  }, [])

  if (isLoading) {
    return (
      <Loading />
    )
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />

        <Text className="mt-4 text-zinc-400 font-semibold text-base lowercase">
          {dayOfWeek}
        </Text>

        <Text className="mt-2 text-white font-extrabold text-3xl">
          {dayAndMonth}
        </Text>

        <ProgressBar progress={habitsProgress} />

        <View className={clsx('mt-6', {
          ['opacity-50']: isDateInPast,
        })}>
          {dayInfo?.possibleHabits ? dayInfo.possibleHabits.map(habit => (
            <Checkbox 
              key={habit.id}
              title={habit.title}
              checked={dayInfo.completedHabits.includes(habit.id)}
              disabled={isDateInPast}
              onPress={() => handleToggleHabit(habit.id)}
            />
          )) : (
            <HabitEmpty />
          )}
        </View>

        {isDateInPast && (
          <Text className="text-white mt-10 text-center">
            Você não pode editar hábitos de uma data anterior ao dia atual.
          </Text>
        )}
      </ScrollView>
    </View>
  )
}