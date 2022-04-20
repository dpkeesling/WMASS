'use strict'
// class Reservoir {
//     constructor(catchment, storageCapacity, initialStorage, finalStorage) {
//       this.imgPath = "./icons/hydroElectricPP.png"
//       this.iconSize = [96, 96]
//       this.iconAnchor = [48, 48]
//       this.popupAnchor = [0, -30]
//       this.catchment = catchment
//       this.storageCapacity = storageCapacity
//       this.initialStorage = initialStorage
//       this.finalStorage = finalStorage
//     }
// }

class Reservoir {
    constructor(catchment, storageCapacity, initialStorage, finalStorage, productionFactor, turbineCapacity, operationalProductionCost, efficiency) {
      this.radius = 50.0
      this.color = '#0000FF'
      this.catchment = catchment
      this.storageCapacity = storageCapacity
      this.initialStorage = initialStorage
      this.finalStorage = finalStorage
      this.productionFactor = productionFactor
      this.turbineCapacity = turbineCapacity
      this.operationalProductionCost = operationalProductionCost
      this.efficiency = efficiency
    }
}