import fallbackData from "../data/batteryDpp.json";

const RAW_AAS_URL = import.meta.env.VITE_AAS_BASE_URL || "http://158.158.54.56:8081";
const AAS_BASE_URL =
  typeof window !== "undefined" &&
  window.location.protocol === "https:" &&
  RAW_AAS_URL.startsWith("http://")
    ? "/api/aas"
    : RAW_AAS_URL;

// Extrae texto de MultiLanguageProperty priorizando español ('es') o inglés ('en')
function getMlpText(mlp, fallback = "") {
  if (!mlp || !Array.isArray(mlp.value) || mlp.value.length === 0) return fallback;
  const es = mlp.value.find((v) => v.language === "es");
  if (es?.text) return es.text;
  const en = mlp.value.find((v) => v.language === "en");
  if (en?.text) return en.text;
  return mlp.value[0]?.text || fallback;
}

// Busca un elemento hijo por idShort
function findEl(elements = [], idShort) {
  return elements.find((el) => el.idShort === idShort);
}

// Lee el valor tipado de una Property simple
function getPropVal(elements = [], idShort, fallback = undefined) {
  const el = findEl(elements, idShort);
  if (!el || el.value === undefined || el.value === null || el.value === "") {
    return fallback;
  }
  if (["xs:float", "xs:double", "xs:decimal"].includes(el.valueType)) {
    const num = Number(el.value);
    return Number.isNaN(num) ? fallback : num;
  }
  if (["xs:integer", "xs:unsignedInt"].includes(el.valueType)) {
    const num = parseInt(el.value, 10);
    return Number.isNaN(num) ? fallback : num;
  }
  if (el.valueType === "xs:boolean") {
    return el.value === "true" || el.value === true;
  }
  return el.value;
}

const CATEGORY_LABELS = {
  lmt: "Movilidad Ligera (LMT · e-Bike)",
  ev: "Vehículo Eléctrico (EV)",
  industrial: "Batería Industrial",
  stationary: "Almacenamiento Estacionario (SB)",
};

const TARGET_2031_SHARES = {
  cobalt: 16,
  lithium: 6,
  nickel: 6,
};

const MATERIAL_LABELS_ES = {
  cobalt: "Cobalto (Co)",
  lithium: "Litio (Li)",
  nickel: "Níquel (Ni)",
};

export async function fetchBatteryDpp() {
  if (!AAS_BASE_URL) {
    return { data: fallbackData, source: "local" };
  }

  try {
    const res = await fetch(`${AAS_BASE_URL}/submodels`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const payload = await res.json();
    const submodels = Array.isArray(payload) ? payload : payload.result || [];

    if (submodels.length === 0) {
      return { data: fallbackData, source: "local" };
    }

    // Localizar los 7 submodelos oficiales cargados en BaSyx
    const smNameplate = submodels.find((s) => s.idShort === "Nameplate");
    const smCarbon = submodels.find((s) => s.idShort === "CarbonFootprint");
    const smDocs = submodels.find((s) => s.idShort === "HandoverDocumentation");
    const smTech = submodels.find((s) => s.idShort === "TechnicalData");
    const smCond = submodels.find((s) => s.idShort === "ProductCondition");
    const smMat = submodels.find((s) => s.idShort === "MaterialComposition");
    const smCirc = submodels.find((s) => s.idShort === "Circularity");

    const mapped = structuredClone(fallbackData);

    // 1. NAMEPLATE (IDTA 02006 / 02035-1)
    if (smNameplate?.submodelElements) {
      const els = smNameplate.submodelElements;
      mapped.submodels.public_nameplate.manufacturer = getMlpText(
        findEl(els, "ManufacturerName"),
        mapped.submodels.public_nameplate.manufacturer
      );
      mapped.submodels.public_nameplate.product_name = getMlpText(
        findEl(els, "ManufacturerProductDesignation"),
        mapped.submodels.public_nameplate.product_name
      );
      mapped.battery_id = getPropVal(els, "SerialNumber", mapped.battery_id);
      mapped.submodels.public_nameplate.manufacturing_date = getPropVal(
        els,
        "DateOfManufacture",
        mapped.submodels.public_nameplate.manufacturing_date
      );
      const country = getPropVal(els, "CountryOfOrigin");
      if (country) {
        mapped.submodels.public_nameplate.manufacturing_plant = `Planta de Ensamblaje (${country})`;
      }
    }

    // 2. TECHNICAL DATA (IDTA 02035-4)
    if (smTech?.submodelElements) {
      const genInfo = findEl(smTech.submodelElements, "GeneralInformation")?.value || [];
      mapped.submodels.public_nameplate.weight_kg = getPropVal(
        genInfo,
        "BatteryMass",
        mapped.submodels.public_nameplate.weight_kg
      );
      const rawCat = getPropVal(genInfo, "BatteryCategory");
      if (rawCat && CATEGORY_LABELS[rawCat.toLowerCase()]) {
        mapped.submodels.public_nameplate.battery_category =
          CATEGORY_LABELS[rawCat.toLowerCase()];
      }

      const techAreas = findEl(smTech.submodelElements, "TechnicalPropertyAreas")?.value || [];
      const capVolt = findEl(techAreas, "CapacityEnergyVoltage")?.value || [];
      const efficiency = findEl(techAreas, "RoundTripEnergyEfficiency")?.value || [];
      const resistance = findEl(techAreas, "Resistance")?.value || [];
      const lifetime = findEl(techAreas, "Lifetime")?.value || [];

      mapped.submodels.public_nameplate.nominal_voltage_v = getPropVal(
        capVolt,
        "NominalVoltage",
        mapped.submodels.public_nameplate.nominal_voltage_v
      );
      mapped.submodels.public_nameplate.rated_capacity_ah = getPropVal(
        capVolt,
        "RatedCapacity",
        mapped.submodels.public_nameplate.rated_capacity_ah
      );
      mapped.submodels.public_nameplate.nominal_capacity_wh = getPropVal(
        capVolt,
        "CertifiedUsableBatteryEnergy",
        mapped.submodels.public_nameplate.nominal_capacity_wh
      );

      const initRes = getPropVal(
        resistance,
        "InitialInternalResistanceOnBatteryPackLevel",
        mapped.submodels.performance_durability.internal_resistance_initial_mohm
      );
      const resIncreasePct = getPropVal(
        resistance,
        "InternalResistanceIncreaseOfBatteryPackLevel",
        0
      );
      mapped.submodels.performance_durability.internal_resistance_initial_mohm = initRes;
      if (resIncreasePct > 0) {
        mapped.submodels.performance_durability.internal_resistance_current_mohm = Number(
          (initRes * (1 + resIncreasePct / 100)).toFixed(1)
        );
      }

      mapped.submodels.performance_durability.round_trip_efficiency_initial_pct = getPropVal(
        efficiency,
        "InitialRoundTripEnergyEfficiency",
        mapped.submodels.performance_durability.round_trip_efficiency_initial_pct
      );
      mapped.submodels.performance_durability.round_trip_efficiency_50pct_life_pct = getPropVal(
        efficiency,
        "RoundTripEnergyEfficiencyAt50PercentOfCycleLife",
        mapped.submodels.performance_durability.round_trip_efficiency_50pct_life_pct
      );
      mapped.submodels.performance_durability.expected_lifetime_cycles = getPropVal(
        lifetime,
        "ExpectedNumberOfCycles",
        mapped.submodels.performance_durability.expected_lifetime_cycles
      );
      mapped.submodels.performance_durability.expected_lifetime_years = getPropVal(
        lifetime,
        "ExpectedLifetimeInCalendarYears",
        mapped.submodels.performance_durability.expected_lifetime_years
      );
      mapped.submodels.performance_durability.capacity_exhaustion_threshold_pct = getPropVal(
        lifetime,
        "CapacityThresholdExhaustion",
        mapped.submodels.performance_durability.capacity_exhaustion_threshold_pct
      );
    }

    // 3. PRODUCT CONDITION - TELEMETRÍA BMS (IDTA 02035-5)
    if (smCond?.submodelElements) {
      const els = smCond.submodelElements;
      const sohCol = findEl(els, "StateOfCertifiedEnergy")?.value || [];
      const cyclesCol = findEl(els, "NumberOfFullCycles")?.value || [];
      const remEnergyCol = findEl(els, "RemainingEnergy")?.value || [];

      mapped.submodels.dynamic_bms.state_of_health_soh = getPropVal(
        sohCol,
        "StateOfCertifiedEnergyValue",
        mapped.submodels.dynamic_bms.state_of_health_soh
      );
      mapped.submodels.dynamic_bms.charge_cycles = getPropVal(
        cyclesCol,
        "NumberOfFullCyclesValue",
        mapped.submodels.dynamic_bms.charge_cycles
      );
      mapped.submodels.dynamic_bms.remaining_capacity_wh = getPropVal(
        remEnergyCol,
        "RemainingEnergyValue",
        mapped.submodels.dynamic_bms.remaining_capacity_wh
      );
      const lastSync = getPropVal(sohCol, "LastUpdate");
      if (lastSync) {
        mapped.submodels.dynamic_bms.last_sync = `Sincronizado desde Azure BaSyx (${lastSync.replace("T", " ")})`;
      }
    }

    // 4. CARBON FOOTPRINT (IDTA 02023 / 02035-3)
    if (smCarbon?.submodelElements) {
      const pcfList = findEl(smCarbon.submodelElements, "ProductCarbonFootprints")?.value || [];
      const pcfItem = pcfList[0]?.value || [];
      mapped.submodels.carbon_circularity.carbon_footprint_kg_kwh = getPropVal(
        pcfItem,
        "PcfCO2eq",
        mapped.submodels.carbon_circularity.carbon_footprint_kg_kwh
      );
      const perfClass = getPropVal(pcfItem, "PerformanceClass");
      if (perfClass) {
        mapped.submodels.carbon_circularity.performance_class = perfClass;
      }
    }

    // 5. MATERIAL COMPOSITION (IDTA 02035-6)
    if (smMat?.submodelElements) {
      const chemCol = findEl(smMat.submodelElements, "BatteryChemistry")?.value || [];
      const shortChem = getPropVal(chemCol, "ShortName");
      const clearChem = getPropVal(chemCol, "ClearName");
      if (shortChem) {
        mapped.submodels.public_nameplate.chemistry = shortChem;
      }

      const materialsList = findEl(smMat.submodelElements, "BatteryMaterials")?.value || [];
      if (materialsList.length > 0) {
        const crmSummary = materialsList
          .map((m) => {
            const mEls = m.value || [];
            const name = getPropVal(mEls, "BatteryMaterialName");
            const mass = getPropVal(mEls, "BatteryMaterialMass");
            return name && mass !== undefined ? `${name}: ${mass} g` : name;
          })
          .filter(Boolean)
          .join(" · ");

        mapped.submodels.recycler_chemistry.cathode = `${clearChem || shortChem || "NMC 811"} (${crmSummary})`;
      }

      const hazList = findEl(smMat.submodelElements, "HazardousSubstances")?.value || [];
      if (hazList.length > 0) {
        mapped.submodels.recycler_chemistry.hazardous_substances = hazList.map((h) => {
          const hEls = h.value || [];
          const name = getPropVal(hEls, "HazardousSubstanceName", "Sustancia");
          const cas = getPropVal(hEls, "HazardousSubstanceIdentifier", "-");
          const conc = getPropVal(hEls, "HazardousSubstanceConcentration");
          const locCol = findEl(hEls, "HazardousSubstanceLocation")?.value || [];
          const loc = getPropVal(locCol, "ComponentName", "Cathode");
          return conc !== undefined
            ? `${name} [CAS ${cas}] · ${conc}% en ${loc}`
            : `${name} [CAS ${cas}]`;
        });
      }

      mapped.submodels.recycler_chemistry.source_node = `Azure BaSyx AAS v3.0 (${smMat.idShort})`;
    }

    // 6. CIRCULARITY (IDTA 02035-7)
    if (smCirc?.submodelElements) {
      const els = smCirc.submodelElements;
      const safetyCol = findEl(els, "SafetyMeasures")?.value || [];
      const extList = findEl(safetyCol, "ExtinguishingAgents")?.value || [];
      if (extList.length > 0) {
        const agents = extList.map((item) => item.value).filter(Boolean);
        if (agents.length > 0) {
          mapped.submodels.public_nameplate.extinguishing_agents = agents;
        }
      }

      const dismantlingList = findEl(els, "DismantlingAndRemovalInformation")?.value || [];
      if (dismantlingList[0]?.value) {
        mapped.submodels.workshop_repair.disassembly_manual = dismantlingList[0].value;
      }

      const sparesList = findEl(els, "SparePartSources")?.value || [];
      const extractedParts = [];
      for (const supplier of sparesList) {
        const sEls = supplier.value || [];
        const comps = findEl(sEls, "Components")?.value || [];
        for (const comp of comps) {
          const cEls = comp.value || [];
          const partName = getPropVal(cEls, "PartName");
          const partNum = getPropVal(cEls, "PartNumber");
          if (partName) {
            extractedParts.push(partNum ? `${partName} (${partNum})` : partName);
          }
        }
      }
      if (extractedParts.length > 0) {
        mapped.submodels.workshop_repair.spare_parts = extractedParts;
      }

      const recList = findEl(els, "RecycledContentInformation")?.value || [];
      if (recList.length > 0) {
        const parsedRecycled = recList
          .map((item) => {
            const rEls = item.value || [];
            const rawMat = (getPropVal(rEls, "RecycledMaterial", "") || "").trim();
            const key = rawMat.toLowerCase();
            const pre = getPropVal(rEls, "PreConsumerShare", 0);
            const post = getPropVal(rEls, "PostConsumerShare", 0);
            if (!rawMat) return null;
            return {
              material: MATERIAL_LABELS_ES[key] || rawMat,
              actual: Number((pre + post).toFixed(1)),
              target_2031: TARGET_2031_SHARES[key] || 10,
            };
          })
          .filter(Boolean);

        if (parsedRecycled.length > 0) {
          mapped.submodels.carbon_circularity.recycled_content = parsedRecycled;
        }
      }
    }

    // 7. HANDOVER DOCUMENTATION (IDTA 02004 / 02035-2)
    if (smDocs?.submodelElements) {
      const docsList = findEl(smDocs.submodelElements, "Documents")?.value || [];
      for (const doc of docsList) {
        const dEls = doc.value || [];
        const idCol = findEl(dEls, "DocumentIds")?.value?.[0]?.value || [];
        const classCol = findEl(dEls, "DocumentClassifications")?.value?.[0]?.value || [];
        const verCol = findEl(dEls, "DocumentVersions")?.value?.[0]?.value || [];

        const classId = getPropVal(classCol, "ClassId", "");
        const docId = getPropVal(idCol, "DocumentIdentifier", "");
        const statusDate = getPropVal(verCol, "StatusSetDate", "");

        if (classId === "03-01" && docId) {
          mapped.submodels.regulatory_compliance.eu_declaration_id = docId;
          if (statusDate) {
            mapped.submodels.regulatory_compliance.audit_date = statusDate;
          }
        }
        if (classId === "04-01" && docId) {
          mapped.submodels.workshop_repair.disassembly_manual = docId;
        }
      }
    }

    return { data: mapped, source: "basyx" };
  } catch (err) {
    console.warn("No se pudo conectar con Azure BaSyx, usando datos locales:", err.message);
    return { data: fallbackData, source: "local" };
  }
}