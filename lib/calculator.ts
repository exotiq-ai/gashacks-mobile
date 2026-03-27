export interface BlendInput {
  tankSize: number;
  currentLevel: number;
  currentEthanol: number;
  targetEthanol: number;
  pumpGasEthanol: number;
  ethanolFuelPercent: number;
}

export interface BlendResult {
  ethanolToAdd: number;
  pumpGasToAdd: number;
  resultingMix: number;
  octaneRating: number;
  currentFuelVolume: number;
  totalFuelAfter: number;
  canFillToTarget: boolean;
  errorMessage?: string;
}

export interface OctaneConfig {
  pumpGasOctane: number;
  ethanolFuelOctane: number;
}

const DEFAULT_OCTANE: OctaneConfig = {
  pumpGasOctane: 91,
  ethanolFuelOctane: 102,
};

export function calculateBlend(
  input: BlendInput,
  octaneConfig: OctaneConfig = DEFAULT_OCTANE
): BlendResult {
  const {
    tankSize,
    currentLevel,
    currentEthanol,
    targetEthanol,
    pumpGasEthanol,
    ethanolFuelPercent,
  } = input;

  const currentLevelDecimal = currentLevel / 100;
  const currentEthanolDecimal = currentEthanol / 100;
  const targetEthanolDecimal = targetEthanol / 100;
  const pumpGasEthanolDecimal = pumpGasEthanol / 100;
  const ethanolFuelDecimal = ethanolFuelPercent / 100;

  const currentFuelVolume = tankSize * currentLevelDecimal;
  const currentEthanolVolume = currentFuelVolume * currentEthanolDecimal;
  const availableSpace = tankSize - currentFuelVolume;

  if (targetEthanol < currentEthanol && currentLevel > 0) {
    return {
      ethanolToAdd: 0,
      pumpGasToAdd: 0,
      resultingMix: currentEthanol,
      octaneRating: 0,
      currentFuelVolume,
      totalFuelAfter: currentFuelVolume,
      canFillToTarget: false,
      errorMessage:
        "Can't reduce E-mix without draining the tank first. You're already running too hot.",
    };
  }

  const rightSide =
    targetEthanolDecimal * currentFuelVolume - currentEthanolVolume;
  const ethanolCoeff = ethanolFuelDecimal - targetEthanolDecimal;
  const pumpGasCoeff = pumpGasEthanolDecimal - targetEthanolDecimal;

  let ethanolToAdd = 0;
  let pumpGasToAdd = 0;

  if (Math.abs(ethanolCoeff) < 0.0001 && Math.abs(pumpGasCoeff) < 0.0001) {
    ethanolToAdd = 0;
    pumpGasToAdd = 0;
  } else if (Math.abs(ethanolCoeff) < 0.0001) {
    // Target equals ethanol fuel content. To preserve that target at fill, add only ethanol.
    ethanolToAdd = availableSpace;
    pumpGasToAdd = 0;
  } else if (Math.abs(pumpGasCoeff) < 0.0001) {
    // Target equals pump gas ethanol content. To preserve that target at fill, add only pump gas.
    ethanolToAdd = 0;
    pumpGasToAdd = availableSpace;
  } else {
    ethanolToAdd =
      (availableSpace * pumpGasCoeff - rightSide) /
      (pumpGasCoeff - ethanolCoeff);
    pumpGasToAdd = availableSpace - ethanolToAdd;

    if (ethanolToAdd < 0 || pumpGasToAdd < 0) {
      ethanolToAdd = rightSide / ethanolCoeff;
      pumpGasToAdd = 0;

      if (ethanolToAdd < 0 || ethanolToAdd > availableSpace) {
        ethanolToAdd = 0;
        pumpGasToAdd = rightSide / pumpGasCoeff;

        if (pumpGasToAdd < 0 || pumpGasToAdd > availableSpace) {
          return {
            ethanolToAdd: 0,
            pumpGasToAdd: 0,
            resultingMix: currentEthanol,
            octaneRating: 0,
            currentFuelVolume,
            totalFuelAfter: currentFuelVolume,
            canFillToTarget: false,
            errorMessage:
              "Can't hit that target E-mix with the space left. Burn off some fuel first.",
          };
        }
      }
    }
  }

  ethanolToAdd = Math.max(0, Math.round(ethanolToAdd * 100) / 100);
  pumpGasToAdd = Math.max(0, Math.round(pumpGasToAdd * 100) / 100);

  const totalFuelAfter = currentFuelVolume + ethanolToAdd + pumpGasToAdd;
  const totalEthanolAfter =
    currentEthanolVolume +
    ethanolToAdd * ethanolFuelDecimal +
    pumpGasToAdd * pumpGasEthanolDecimal;
  const resultingMix =
    totalFuelAfter > 0 ? (totalEthanolAfter / totalFuelAfter) * 100 : 0;

  const currentFuelOctane =
    octaneConfig.pumpGasOctane +
    (octaneConfig.ethanolFuelOctane - octaneConfig.pumpGasOctane) *
      currentEthanolDecimal;

  const octaneRating =
    totalFuelAfter > 0
      ? (currentFuelVolume * currentFuelOctane +
          ethanolToAdd * octaneConfig.ethanolFuelOctane +
          pumpGasToAdd * octaneConfig.pumpGasOctane) /
        totalFuelAfter
      : currentFuelOctane;

  return {
    ethanolToAdd,
    pumpGasToAdd,
    resultingMix: Math.round(resultingMix * 10) / 10,
    octaneRating: Math.round(octaneRating * 10) / 10,
    currentFuelVolume: Math.round(currentFuelVolume * 100) / 100,
    totalFuelAfter: Math.round(totalFuelAfter * 100) / 100,
    canFillToTarget: true,
  };
}

export function calculateEmptyTankBlend(
  tankSize: number,
  targetEthanol: number,
  pumpGasEthanol: number,
  ethanolFuelPercent: number,
  octaneConfig: OctaneConfig = DEFAULT_OCTANE
): BlendResult {
  return calculateBlend(
    {
      tankSize,
      currentLevel: 0,
      currentEthanol: 0,
      targetEthanol,
      pumpGasEthanol,
      ethanolFuelPercent,
    },
    octaneConfig
  );
}

export function calculateEthanolOnlyBlend(
  input: BlendInput,
  octaneConfig: OctaneConfig = DEFAULT_OCTANE
): BlendResult {
  const { tankSize, currentLevel, currentEthanol, ethanolFuelPercent } = input;

  const currentLevelDecimal = currentLevel / 100;
  const currentEthanolDecimal = currentEthanol / 100;
  const ethanolFuelDecimal = ethanolFuelPercent / 100;

  const currentFuelVolume = tankSize * currentLevelDecimal;
  const currentEthanolVolume = currentFuelVolume * currentEthanolDecimal;
  const availableSpace = tankSize - currentFuelVolume;

  const ethanolToAdd = availableSpace;
  const totalFuelAfter = currentFuelVolume + ethanolToAdd;
  const totalEthanolAfter =
    currentEthanolVolume + ethanolToAdd * ethanolFuelDecimal;
  const resultingMix = (totalEthanolAfter / totalFuelAfter) * 100;

  return {
    ethanolToAdd: Math.round(ethanolToAdd * 100) / 100,
    pumpGasToAdd: 0,
    resultingMix: Math.round(resultingMix * 10) / 10,
    octaneRating: octaneConfig.ethanolFuelOctane,
    currentFuelVolume: Math.round(currentFuelVolume * 100) / 100,
    totalFuelAfter: Math.round(totalFuelAfter * 100) / 100,
    canFillToTarget: true,
  };
}
