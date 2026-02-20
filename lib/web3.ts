import type { Job } from "./normalize";

const WEB3_KEYWORDS = [
  "web3","blockchain","crypto","cryptocurrency","defi","nft","dao","dapp",
  "smart contract","smart-contract","solidity","evm","ethereum",
  "layer 2","layer2","l2","rollup","zk","zero knowledge","zero-knowledge",
  "zksync","starknet","starkware","arbitrum","optimism","base","polygon",
  "cosmos","polkadot","substrate","near","avalanche",
  "foundry","hardhat","ethers","web3.js","viem","wagmi",
  "rust","move","cairo","vyper",
  "ipfs","libp2p","the graph","subgraph",
  "erc20","erc-20","erc721","erc-721","erc1155","erc-1155",
  "token","wallet","metamask","chainlink","oracle","validator","staking",
  "protocol","cryptography","zero-knowledge proof","zkp","zk-snark","zk-stark",
  "devrel","developer relations","ecosystem"
];

export function isWeb3Job(job: Job): boolean {
  const text = [
    job.title,
    job.company,
    job.location,
    job.snippet,
    ...(job.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return WEB3_KEYWORDS.some((k) => text.includes(k));
}
