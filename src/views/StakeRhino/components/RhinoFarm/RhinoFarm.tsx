import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useWallet } from '@binance-chain/bsc-use-wallet'
import { provider } from 'web3-core'
import PageHeader from '../../../../components/PageHeader'
import Spacer from '../../../../components/Spacer'
import useFarm from '../../../../hooks/useFarm'
import useRedeem from '../../../../hooks/useRedeem'
import usePanda from '../../../../hooks/usePanda'
import { getMasterChefContract } from '../../../../panda/utils'
import { getContract } from '../../../../utils/erc20'
import Harvest from './components/Harvest'
import { PoolType } from '../../../../contexts/Farms/types'
import Stake from './components/Stake'
import Container from '../../../../components/Container'

const Farm: React.FC = () => {
	const { farmId } = useParams()
	const {
		pid,
		lpToken,
		lpTokenAddress,
		tokenAddress,
		earnToken,
		name,
		icon,
		refUrl,
		poolType,
	} = useFarm(farmId) || {
		pid: 0,
		lpToken: '',
		lpTokenAddress: '',
		tokenAddress: '',
		earnToken: '',
		name: '',
		icon: '',
		refUrl: '',
		poolType: PoolType.PNDA,
	}

	useEffect(() => {
		window.scrollTo(0, 0)
	}, [])

	const panda = usePanda()
	const { ethereum } = useWallet()

	const lpContract = useMemo(() => {
		return getContract(ethereum as provider, lpTokenAddress)
	}, [ethereum, lpTokenAddress])

	const { onRedeem } = useRedeem(getMasterChefContract(panda))

	const lpTokenName = useMemo(() => {
		return lpToken.toUpperCase()
	}, [lpToken])

	const earnTokenName = useMemo(() => {
		return earnToken.toUpperCase()
	}, [earnToken])

	return (
		<>
			<Container size="sm">
				<StyledPageHeader>
					<StyledIcon>
					🦏
					</StyledIcon>
					<StyledTitle>Rhino Farm</StyledTitle>
					<StyledSubtitle>Stake RHINO and Earn BAMBOO!</StyledSubtitle>
				</StyledPageHeader>
			</Container>
			<StyledFarm>
				<StyledCardsWrapper>
					<StyledCardWrapper>
						<Harvest pid={pid} />
					</StyledCardWrapper>
					<Spacer />
					<StyledCardWrapper>
						<Stake
							lpContract={lpContract}
							pid={pid}
							tokenName={lpToken.toUpperCase()}
							poolType={poolType}
						/>
					</StyledCardWrapper>
				</StyledCardsWrapper>
				<Spacer size="lg" />
				<StyledInfo>
					⭐️ Every time you stake and unstake LP tokens, the contract will
					automagically claim PNDA rewards for you!
				</StyledInfo>
				<Spacer size="lg" />
			</StyledFarm>
		</>
	)
}

const StyledFarm = styled.div`
	align-items: center;
	display: flex;
	flex-direction: column;
	@media (max-width: 768px) {
		width: 100%;
	}
`

const StyledCardsWrapper = styled.div`
	display: flex;
	width: 600px;
	@media (max-width: 768px) {
		width: 100%;
		flex-flow: column nowrap;
		align-items: center;
	}
`

const StyledCardWrapper = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	@media (max-width: 768px) {
		width: 80%;
	}
`

const StyledInfo = styled.h3`
	color: ${(props) => props.theme.color.grey[400]};
	font-size: 16px;
	font-weight: 400;
	margin: 0;
	padding: 0;
	text-align: center;
`

const StyledPageHeader = styled.div`
	align-items: center;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	padding-bottom: ${(props) => props.theme.spacing[6]}px;
	padding-top: ${(props) => props.theme.spacing[6]}px;
	margin: 0 auto;
`

const StyledIcon = styled.div`
	font-size: 120px;
	height: 120px;
	line-height: 120px;
	text-align: center;
`

const StyledTitle = styled.h1`
	font-family: 'Kaushan Script', sans-serif;
	color: ${(props) => props.theme.color.grey[600]};
	font-size: 36px;
	font-weight: 700;
	margin: 0;
	padding: 0;
`

const StyledSubtitle = styled.h3`
	color: ${(props) => props.theme.color.grey[400]};
	font-size: 18px;
	font-weight: 400;
	margin: 0;
	padding: 0;
	text-align: center;
`

export default Farm
