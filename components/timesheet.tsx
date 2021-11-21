import { useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import * as everhour from '../lib/everhour'

const COLORS = ['#083D77', '#DA4167', '#2A9D8F', '#2E4057', '#BFAE48']

interface Props {
	timesheet: everhour.Time[]
}

export const Timesheet = ({ timesheet }: Props) => {
	const [zoom, setZoom] = useState(1)

	const scrollContainer = useRef<HTMLDivElement>(null)

	const firstTimerStart = dayjs(timesheet[0]?.history[0]?.createdAt).subtract(
		timesheet ? timesheet[0]?.history[0]?.time : 0,
		'seconds'
	)

	const lasTimerEnd = timesheet.reduce((a, c) => {
		const lastTimer = c.history.reduce((a, c) => {
			if (c.action === 'TIMER') {
				return dayjs(c.createdAt)
			}
			return a
		}, dayjs(c.history[0].createdAt))

		if (lastTimer.isAfter(a)) {
			return lastTimer
		}
		return a
	}, firstTimerStart)

	const clockTimeMinutes = lasTimerEnd.diff(firstTimerStart, 'minutes')

	useEffect(() => {
		scrollContainer.current?.scrollTo({ left: 0, behavior: 'smooth' })
	}, [timesheet])

	return (
		<div>
			<div
				ref={scrollContainer}
				className='relative px-10 pt-16 w-screen h-screen overflow-y-hidden overflow-x-scroll no-scrollbar'
			>
				<div className='relative'>
					<div className='absolute inset-0 h-full'>
						{[...new Array(Math.round(clockTimeMinutes / 60) + 2)].map((_, i) => {
							const date = dayjs(firstTimerStart).set('minute', 0).add(i, 'hours')
							const left = date.diff(firstTimerStart, 'seconds') / 10

							return (
								<div key={i} style={{ left: left * zoom }} className='absolute top-0'>
									<div className='absolute w-px top-0 h-[calc(100vh-72px)] bg-gray-400' />
									<div className='ml-2 text-gray-600'>{date.add(1, 'h').format('HH:mm')}</div>
								</div>
							)
						})}
					</div>
				</div>
				<div className='mt-12'>
					{timesheet.map((item, index) => {
						const backgroundColor = COLORS[index % COLORS.length]

						return (
							<div key={index} className='relative h-12 my-4'>
								{item.history
									.filter(item => item.action === 'TIMER')
									.map((history, index) => {
										const end = dayjs(history.createdAt)
										const start = end.subtract(history.time, 'seconds')
										const left = (end.diff(firstTimerStart, 'seconds') - history.time) / 10
										const width = history.time / 10

										const minutes = Math.round(history.time / 60)
										const hours = Math.floor(minutes / 60)

										return (
											<div
												key={index}
												style={{ width: width * zoom, left: left * zoom, backgroundColor }}
												className='absolute top-0 h-8 rounded-sm hover-reveal-child transition-all'
											>
												<p className='-mt-7 w-max leading-8 opacity-0 transition-opacity'>
													{start.add(1, 'hour').format('HH:mm')} /{' '}
													{hours > 0
														? `${hours}:${minutes.toString().padStart(2, '0')}h`
														: `${minutes}m`}{' '}
													/ {item.task?.name}
												</p>
											</div>
										)
									})}
							</div>
						)
					})}
				</div>
			</div>
			<div className='fixed bottom-0 inset-x-0 h-14 flex flex-row justify-between items-center'>
				<button
					onClick={() => setZoom(zoom => (zoom >= 0.2 ? zoom - 0.1 : zoom))}
					className='h-full bg-white text-indigo-400 hover:bg-gray-100'
				>
					-
				</button>
				{zoom !== 1 && (
					<div
						onClick={() => setZoom(1)}
						className='text-lg cursor-pointer hover:opacity-70 transition-opacity'
					>
						{zoom.toFixed(1)}x
					</div>
				)}
				<button
					onClick={() => setZoom(zoom => zoom + 0.1)}
					className='h-full bg-white text-indigo-400 hover:bg-gray-100'
				>
					+
				</button>
			</div>
		</div>
	)
}
