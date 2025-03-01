import BigNumber from 'bignumber.js'
import React, { useEffect, useMemo, useState } from 'react'
import Countdown from 'react-countdown'
import type { CountdownRenderProps } from 'react-countdown'
import styled, { keyframes } from 'styled-components'
import { useWallet } from '@binance-chain/bsc-use-wallet'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import CardIcon from '../../../components/CardIcon'
import Loader from '../../../components/Loader'
import Spacer from '../../../components/Spacer'
import { Farm } from '../../../contexts/Farms'
import useAllStakedValue, {
	StakedValue,
} from '../../../hooks/useAllStakedValue'
import useFarms from '../../../hooks/useFarms'
import usePanda from '../../../hooks/usePanda'
import usePandaPrice from '../../../hooks/usePandaPrice'
import { getEarned, getMasterChefContract } from '../../../panda/utils'
import { bnToDec } from '../../../utils'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import './tab-styles.css'
import { PoolType } from '../../../contexts/Farms/types'

interface FarmWithStakedValue extends Farm, StakedValue {
	apy: BigNumber
}

const cardsPerRow = 3

const StyledCardWrapper = styled.div`
	display: flex;
	margin-top: ${(props) => props.theme.spacing[4]}px;
	width: calc((900px - ${(props) => props.theme.spacing[4]}px * 2) / 3);
	position: relative;
`

const FarmCards: React.FC = () => {
	const [farms] = useFarms()
	const stakedValue = useAllStakedValue()
	const pndaPrice = usePandaPrice()

	const BLOCKS_PER_YEAR = new BigNumber(10513333)

	const pools: { [key: string]: FarmWithStakedValue[] } = {
		[PoolType.PNDA]: [],
		[PoolType.CAKE]: [],
		[PoolType.ARCHIVED]: [],
	}

	farms.forEach((farm, i) => {
		const farmWithStakedValue = {
			...farm,
			...stakedValue[i],
			poolType: farm.poolType || PoolType.PNDA,
			apy: stakedValue[i] && pndaPrice
				? pndaPrice
					.times(stakedValue[i].reward)
					.times(BLOCKS_PER_YEAR)
					.div(stakedValue[i].lockedUsd)
				: null,
		}

		pools[farmWithStakedValue.poolType].push(farmWithStakedValue)
	})

	return (
		<Tabs>
			<TabList>
				<Tab>PandaSwap Farms</Tab>
				<Tab>PancakeSwap Farms</Tab>
				<Tab>Archived Farms</Tab>
			</TabList>

			<div style={{ justifyContent: 'center', width: '400' }}>
				<Spacer />
				<Card>
					<CardContent>
						<span>❗️ APYs for single-sided pools are not yet accurate.</span>
						<span>
							❗️ APYs are affected by a 7-day average price of PNDA which has
							not yet stabilized.
						</span>
					</CardContent>
				</Card>
				<Spacer />
			</div>

			<TabPanel>
				<StyledCards>
					{pools[PoolType.PNDA].length ? (
						pools[PoolType.PNDA].map((farm, i) => (
							<React.Fragment key={i}>
								<FarmCard farm={farm} />
								{(i + 1) % cardsPerRow !== 0 && <StyledSpacer />}
							</React.Fragment>
						))
					) : (
						<StyledLoadingWrapper>
							<Loader text="Harvesting the bamboo ..." />
						</StyledLoadingWrapper>
					)}
				</StyledCards>
			</TabPanel>
			<TabPanel>
				<StyledCards>
					{pools[PoolType.CAKE].length ? (
						pools[PoolType.CAKE].map((farm, i) => (
							<React.Fragment key={i}>
								<FarmCard farm={farm} />
								{(i + 1) % cardsPerRow !== 0 && <StyledSpacer />}
							</React.Fragment>
						))
					) : (
						<StyledLoadingWrapper>
							<Loader text="Harvesting the bamboo ..." />
						</StyledLoadingWrapper>
					)}
				</StyledCards>
			</TabPanel>
			<TabPanel>
				<StyledCards>
					{pools[PoolType.ARCHIVED].length ? (
						pools[PoolType.ARCHIVED].map((farm, i) => (
							<React.Fragment key={i}>
								<FarmCard farm={farm} />
								{(i + 1) % cardsPerRow !== 0 && <StyledSpacer />}
							</React.Fragment>
						))
					) : (
						<StyledLoadingWrapper>
							<Loader text="Harvesting the bamboo ..." />
						</StyledLoadingWrapper>
					)}
				</StyledCards>
			</TabPanel>
		</Tabs>
	)
}

interface FarmCardProps {
	farm: FarmWithStakedValue
}

export const FarmCard: React.FC<FarmCardProps> = ({ farm }) => {
	const [startTime, setStartTime] = useState(0)
	const [harvestable, setHarvestable] = useState(0)

	const { account } = useWallet()
	const { pid } = farm
	const panda = usePanda()

	// disable single-sided pools temporarily
	const isManualDisableAPY = farm.lpTokenAddress == farm.tokenAddress

	const renderer = (countdownProps: CountdownRenderProps) => {
		const { hours, minutes, seconds } = countdownProps
		const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
		const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
		const paddedHours = hours < 10 ? `0${hours}` : hours
		return (
			<span style={{ width: '100%' }}>
				{paddedHours}:{paddedMinutes}:{paddedSeconds}
			</span>
		)
	}

	useEffect(() => {
		async function fetchEarned() {
			if (panda) return
			const earned = await getEarned(getMasterChefContract(panda), pid, account)
			setHarvestable(bnToDec(earned))
		}
		if (panda && account) {
			fetchEarned()
		}
	}, [panda, pid, account, setHarvestable])

	const poolActive = true // startTime * 1000 - Date.now() <= 0
	const tokenBuy = 'Buy ' + farm.tokenSymbol
	const destination = farm.refUrl
	return (
		<StyledCardWrapper>
			{farm.tokenSymbol === 'PNDA' && <StyledCardAccent />}
			<Card>
				<CardContent>
					<StyledContent>
						<CardIcon>
							<img src={farm.icon} alt="" height="50" />
						</CardIcon>
						<StyledTitle>{farm.name}</StyledTitle>
						<StyledDetails>
							<StyledDetail>Deposit {farm.lpToken.toUpperCase()}</StyledDetail>
							<StyledDetail>Earn {farm.earnToken.toUpperCase()}</StyledDetail>
						</StyledDetails>
						<Spacer />
						<Button
							disabled={!poolActive}
							text={poolActive ? 'Select' : undefined}
							to={`/farms/${farm.id}`}
						>
							{!poolActive && (
								<Countdown
									date={new Date(startTime * 1000)}
									renderer={renderer}
								/>
							)}
						</Button>
						<Spacer />
						<Button text={tokenBuy} href={destination}></Button>
						<StyledInsight>
							<span>APY</span>
							<span>
								{farm.apy
									? `${farm.apy
											.times(new BigNumber(100))
											.toNumber()
											.toLocaleString('en-US')
											.slice(0, -1)}%`
									: 'Loading ...'}
							</span>
							{/* <span>
                {farm.tokenAmount
                  ? (farm.tokenAmount.toNumber() || 0).toLocaleString('en-US')
                  : '-'}{' '}
                {farm.tokenSymbol}
              </span>
              <span>
                {farm.wbnbAmount
                  ? (farm.wbnbAmount.toNumber() || 0).toLocaleString('en-US')
                  : '-'}{' '}
                ETH
              </span> */}
						</StyledInsight>
					</StyledContent>
				</CardContent>
			</Card>
		</StyledCardWrapper>
	)
}

const RainbowLight = keyframes`

	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
`

const StyledCardAccent = styled.div`
	background: linear-gradient(
		45deg,
		rgba(255, 0, 0, 1) 0%,
		rgba(255, 154, 0, 1) 10%,
		rgba(208, 222, 33, 1) 20%,
		rgba(79, 220, 74, 1) 30%,
		rgba(63, 218, 216, 1) 40%,
		rgba(47, 201, 226, 1) 50%,
		rgba(28, 127, 238, 1) 60%,
		rgba(95, 21, 242, 1) 70%,
		rgba(186, 12, 248, 1) 80%,
		rgba(251, 7, 217, 1) 90%,
		rgba(255, 0, 0, 1) 100%
	);
	background-size: 300% 300%;
	animation: ${RainbowLight} 2s linear infinite;
	border-radius: 12px;
	filter: blur(6px);
	position: absolute;
	top: -2px;
	right: -2px;
	bottom: -2px;
	left: -2px;
	z-index: -1;
`

const StyledCards = styled.div`
	width: 900px;
	display: flex;
	flex-flow: row wrap;
	justify-content: space-evenly;
	@media (max-width: 768px) {
		width: 100%;
		flex-flow: column nowrap;
		align-items: center;
	}
`

const StyledLoadingWrapper = styled.div`
	align-items: center;
	display: flex;
	flex: 1;
	justify-content: center;
`

const StyledTitle = styled.h4`
	color: ${(props) => props.theme.color.grey[600]};
	font-size: 19px;
	font-weight: 700;
	margin: ${(props) => props.theme.spacing[2]}px 0 0;
	padding: 0;
`

const StyledContent = styled.div`
	align-items: center;
	display: flex;
	flex-direction: column;
`

const StyledSpacer = styled.div`
	height: ${(props) => props.theme.spacing[4]}px;
	width: ${(props) => props.theme.spacing[4]}px;
`

const StyledDetails = styled.div`
	margin-top: ${(props) => props.theme.spacing[2]}px;
	text-align: center;
`

const StyledDetail = styled.div`
	color: ${(props) => props.theme.color.grey[500]};
`

const StyledInsight = styled.div`
	display: flex;
	justify-content: space-between;
	box-sizing: border-box;
	border-radius: 8px;
	background: #fffdfa;
	color: #aa9584;
	width: 100%;
	margin-top: 12px;
	line-height: 32px;
	font-size: 13px;
	border: 1px solid #e6dcd5;
	text-align: center;
	padding: 0 12px;
`

export default FarmCards
