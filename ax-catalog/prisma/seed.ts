import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AX Catalog database...\n');

  // --- Clean existing data (reverse dependency order) ---
  console.log('Cleaning existing data...');
  await prisma.favorite.deleteMany();
  await prisma.techStackEntry.deleteMany();
  await prisma.useCase.deleteMany();
  await prisma.catalogItem.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.industry.deleteMany();
  await prisma.user.deleteMany();
  console.log('Existing data cleared.\n');

  // --- Users ---
  console.log('Creating users...');
  const admin = await prisma.user.create({
    data: {
      id: 'user-admin',
      email: 'admin@kt.com',
      name: '김관리',
      role: 'ADMIN',
    },
  });
  const editor = await prisma.user.create({
    data: {
      id: 'user-editor',
      email: 'editor@kt.com',
      name: '이편집',
      role: 'EDITOR',
    },
  });
  const viewer = await prisma.user.create({
    data: {
      id: 'user-viewer',
      email: 'viewer@kt.com',
      name: '박열람',
      role: 'VIEWER',
    },
  });
  console.log(`  Created ${3} users.\n`);

  // --- Industries ---
  console.log('Creating industries...');
  const industryNames = [
    'Manufacturing',
    'Finance',
    'Public Sector',
    'Logistics',
    'Telecom',
    'Healthcare',
    'Retail',
    'Energy',
  ];
  const industries: Record<string, Awaited<ReturnType<typeof prisma.industry.create>>> = {};
  for (const name of industryNames) {
    industries[name] = await prisma.industry.create({ data: { name } });
  }
  console.log(`  Created ${industryNames.length} industries.\n`);

  // --- Organizations ---
  console.log('Creating organizations...');
  const orgNames = [
    'AX Digital Transformation',
    'AX Cloud Solutions',
    'AX Data Intelligence',
    'AX Industry Solutions',
    'AX Platform Engineering',
  ];
  const orgs: Record<string, Awaited<ReturnType<typeof prisma.organization.create>>> = {};
  for (const name of orgNames) {
    orgs[name] = await prisma.organization.create({ data: { name } });
  }
  console.log(`  Created ${orgNames.length} organizations.\n`);

  // --- Catalog Items ---
  console.log('Creating catalog items...');

  const catalogItemDefs = [
    // PRODUCT items (5)
    {
      category: 'PRODUCT' as const,
      name: 'AX Smart Factory Platform',
      valueProposition: 'End-to-end smart factory solution integrating IoT sensors, real-time monitoring, and predictive maintenance to achieve 30%+ OEE improvement.',
      keyFeatures: 'Real-time equipment monitoring, AI-based predictive maintenance, Digital twin simulation, MES/ERP integration, Anomaly detection dashboard',
      differentiation: 'Pre-built manufacturing domain models with 200+ industry-specific KPI templates and Korean regulatory compliance built-in.',
      deliveryType: 'SAAS' as const,
      deliveryModel: 'SUBSCRIPTION' as const,
      status: 'PUBLISHED' as const,
      targetIndustry: 'Manufacturing',
      owningOrg: 'AX Industry Solutions',
      author: admin,
    },
    {
      category: 'PRODUCT' as const,
      name: 'AX Fraud Detection Suite',
      valueProposition: 'Real-time financial fraud detection leveraging graph neural networks and behavioral analytics, reducing false positives by 60%.',
      keyFeatures: 'Real-time transaction scoring, Graph-based relationship analysis, Behavioral biometrics, Regulatory reporting automation, Case management workflow',
      differentiation: 'Trained on 500M+ Korean financial transactions with built-in compliance for FSC/FSS regulations.',
      deliveryType: 'SAAS' as const,
      deliveryModel: 'SUBSCRIPTION' as const,
      status: 'PUBLISHED' as const,
      targetIndustry: 'Finance',
      owningOrg: 'AX Data Intelligence',
      author: editor,
    },
    {
      category: 'PRODUCT' as const,
      name: 'AX Citizen Service Portal',
      valueProposition: 'Unified digital government service platform enabling seamless citizen interactions across 50+ public services with AI-powered assistance.',
      keyFeatures: 'Multi-channel service delivery, AI chatbot integration, Digital identity verification, Document automation, Service analytics dashboard',
      differentiation: 'Compliant with Korean e-Government Framework and Government Cloud Security Certification (CSAP).',
      deliveryType: 'SAAS' as const,
      deliveryModel: 'SUBSCRIPTION' as const,
      status: 'PUBLISHED' as const,
      targetIndustry: 'Public Sector',
      owningOrg: 'AX Digital Transformation',
      author: admin,
    },
    {
      category: 'PRODUCT' as const,
      name: 'AX Supply Chain Control Tower',
      valueProposition: 'AI-driven supply chain visibility and optimization platform providing end-to-end tracking and demand forecasting with 95%+ accuracy.',
      keyFeatures: 'Real-time shipment tracking, Demand forecasting engine, Inventory optimization, Supplier risk scoring, Carbon footprint tracking',
      differentiation: 'Deep integration with Korean logistics networks (CJ, Hanjin, Lotte) and customs (UNIPASS) systems.',
      deliveryType: 'HYBRID' as const,
      deliveryModel: 'SUBSCRIPTION' as const,
      status: 'PUBLISHED' as const,
      targetIndustry: 'Logistics',
      owningOrg: 'AX Industry Solutions',
      author: editor,
    },
    {
      category: 'PRODUCT' as const,
      name: 'AX Network Intelligence Platform',
      valueProposition: 'Telecom network optimization platform using AI/ML for automated fault detection, capacity planning, and 5G network slicing management.',
      keyFeatures: '5G network slice orchestration, AI-based fault prediction, Capacity planning simulator, Customer experience scoring, Energy optimization',
      differentiation: 'Purpose-built for Korean telecom infrastructure with pre-certified integrations for major Korean carriers.',
      deliveryType: 'HYBRID' as const,
      deliveryModel: 'MANAGED' as const,
      status: 'DRAFT' as const,
      targetIndustry: 'Telecom',
      owningOrg: 'AX Cloud Solutions',
      author: admin,
    },

    // TECHNOLOGY items (5)
    {
      category: 'TECHNOLOGY' as const,
      name: 'AX Kubernetes Service Mesh',
      valueProposition: 'Enterprise-grade service mesh built on Istio with enhanced observability, zero-trust security, and automated canary deployments.',
      keyFeatures: 'Auto mTLS enforcement, Distributed tracing, Traffic mirroring, Circuit breaking, GitOps-based configuration',
      differentiation: 'Managed control plane with Korean cloud provider (NCP, KT Cloud, Kakao Cloud) native integration.',
      deliveryType: 'SAAS' as const,
      deliveryModel: 'SUBSCRIPTION' as const,
      status: 'PUBLISHED' as const,
      targetIndustry: 'Telecom',
      owningOrg: 'AX Platform Engineering',
      author: editor,
    },
    {
      category: 'TECHNOLOGY' as const,
      name: 'AX DataLake Accelerator',
      valueProposition: 'Turnkey data lakehouse solution combining Delta Lake, Apache Spark, and automated data quality pipelines for 10x faster analytics.',
      keyFeatures: 'Auto-schema evolution, Data quality gate, Incremental ETL pipelines, Cost-based query optimization, Multi-cloud storage abstraction',
      differentiation: 'Pre-built connectors for Korean enterprise systems (SAP Korea, Douzone, WEHAGO) and government open data APIs.',
      deliveryType: 'HYBRID' as const,
      deliveryModel: 'PROJECT_BASED' as const,
      status: 'PUBLISHED' as const,
      targetIndustry: 'Finance',
      owningOrg: 'AX Data Intelligence',
      author: admin,
    },
    {
      category: 'TECHNOLOGY' as const,
      name: 'AX Edge Computing Framework',
      valueProposition: 'Lightweight edge runtime for deploying AI inference models at the factory floor with <10ms latency and offline resilience.',
      keyFeatures: 'Model compression toolkit, Edge-cloud sync, OTA firmware updates, Hardware abstraction layer, Edge analytics dashboard',
      differentiation: 'Optimized for Korean semiconductor fab environments and certified for industrial safety standards (KS C IEC 61508).',
      deliveryType: 'BUILD' as const,
      deliveryModel: 'PROJECT_BASED' as const,
      status: 'PUBLISHED' as const,
      targetIndustry: 'Manufacturing',
      owningOrg: 'AX Platform Engineering',
      author: editor,
    },
    {
      category: 'TECHNOLOGY' as const,
      name: 'AX API Gateway Enterprise',
      valueProposition: 'High-performance API gateway handling 100K+ RPS with built-in rate limiting, OAuth2/OIDC, and developer portal for API monetization.',
      keyFeatures: 'GraphQL federation, Rate limiting policies, API versioning, Developer portal, Usage-based billing engine',
      differentiation: 'Native integration with Korean payment gateways (KG Inicis, Toss, NHN KCP) and public data portals.',
      deliveryType: 'SAAS' as const,
      deliveryModel: 'SUBSCRIPTION' as const,
      status: 'PUBLISHED' as const,
      targetIndustry: 'Retail',
      owningOrg: 'AX Platform Engineering',
      author: admin,
    },
    {
      category: 'TECHNOLOGY' as const,
      name: 'AX MLOps Pipeline',
      valueProposition: 'End-to-end machine learning lifecycle management from experiment tracking to production model serving with automated retraining triggers.',
      keyFeatures: 'Experiment tracking, Feature store, Model registry, A/B testing framework, Drift detection, GPU cluster orchestration',
      differentiation: 'Integrated Korean language NLP model hub with domain-specific fine-tuning templates for enterprise Korean text.',
      deliveryType: 'HYBRID' as const,
      deliveryModel: 'MANAGED' as const,
      status: 'DRAFT' as const,
      targetIndustry: 'Healthcare',
      owningOrg: 'AX Data Intelligence',
      author: editor,
    },

    // SERVICE items (4)
    {
      category: 'SERVICE' as const,
      name: 'AX Cloud Migration Factory',
      valueProposition: 'Structured cloud migration service using automated discovery, dependency mapping, and wave-based migration reducing migration time by 40%.',
      keyFeatures: 'Application portfolio assessment, Automated dependency mapping, Migration wave planning, Parallel workstream execution, Post-migration validation',
      differentiation: 'Proven migration playbooks for Korean legacy systems (TMAX, Inisys) and government G-Cloud certification support.',
      deliveryType: 'BUILD' as const,
      deliveryModel: 'PROJECT_BASED' as const,
      status: 'PUBLISHED' as const,
      targetIndustry: 'Public Sector',
      owningOrg: 'AX Cloud Solutions',
      author: admin,
    },
    {
      category: 'SERVICE' as const,
      name: 'AX Digital Twin Consulting',
      valueProposition: 'Strategic consulting and implementation service for industrial digital twins, delivering virtual replicas of physical assets for simulation and optimization.',
      keyFeatures: 'Asset modeling workshop, Sensor integration design, Simulation scenario library, ROI assessment framework, Change management program',
      differentiation: 'Domain expertise in Korean heavy industry (shipbuilding, steel, petrochemical) with Hyundai/POSCO reference architectures.',
      deliveryType: 'BUILD' as const,
      deliveryModel: 'PROJECT_BASED' as const,
      status: 'PUBLISHED' as const,
      targetIndustry: 'Manufacturing',
      owningOrg: 'AX Digital Transformation',
      author: editor,
    },
    {
      category: 'SERVICE' as const,
      name: 'AX Data Governance Program',
      valueProposition: 'Comprehensive data governance implementation covering data catalog, lineage tracking, quality management, and privacy compliance (PIPA/GDPR).',
      keyFeatures: 'Data catalog deployment, Lineage automation, Quality rule engine, Privacy impact assessment, Stewardship workflow',
      differentiation: 'Tailored for Korean data privacy regulations (개인정보보호법) with pre-built templates for FSC financial data governance.',
      deliveryType: 'BUILD' as const,
      deliveryModel: 'PROJECT_BASED' as const,
      status: 'PUBLISHED' as const,
      targetIndustry: 'Finance',
      owningOrg: 'AX Data Intelligence',
      author: admin,
    },
    {
      category: 'SERVICE' as const,
      name: 'AX Energy Management System',
      valueProposition: 'Managed energy optimization service combining IoT monitoring, AI-based load forecasting, and carbon reporting for ESG compliance.',
      keyFeatures: 'Smart meter integration, Load forecasting, Peak shaving automation, Carbon emission tracking, ESG reporting dashboard',
      differentiation: 'Integrated with Korea Power Exchange (KPX) and pre-configured for Korean emissions trading scheme (K-ETS) reporting.',
      deliveryType: 'HYBRID' as const,
      deliveryModel: 'MANAGED' as const,
      status: 'DRAFT' as const,
      targetIndustry: 'Energy',
      owningOrg: 'AX Industry Solutions',
      author: editor,
    },
  ];

  const catalogItems: Record<string, Awaited<ReturnType<typeof prisma.catalogItem.create>>> = {};

  for (const def of catalogItemDefs) {
    const item = await prisma.catalogItem.create({
      data: {
        category: def.category,
        name: def.name,
        valueProposition: def.valueProposition,
        keyFeatures: def.keyFeatures,
        differentiation: def.differentiation,
        deliveryType: def.deliveryType,
        deliveryModel: def.deliveryModel,
        status: def.status,
        targetIndustryId: industries[def.targetIndustry].id,
        owningOrgId: orgs[def.owningOrg].id,
        authorId: def.author.id,
      },
    });
    catalogItems[def.name] = item;
  }
  console.log(`  Created ${catalogItemDefs.length} catalog items.\n`);

  // --- Use Cases ---
  console.log('Creating use cases...');

  const useCaseDefs = [
    // AX Smart Factory Platform
    {
      item: 'AX Smart Factory Platform',
      cases: [
        {
          customerName: '현대자동차 울산공장',
          projectName: 'Smart Paint Shop Optimization',
          projectOverview: 'Deployed IoT sensors and AI models across 12 paint lines to reduce defect rates by 25% and energy consumption by 18% through predictive quality control.',
          projectSize: '$2.4M',
          duration: '8 months',
          industry: 'Manufacturing',
        },
        {
          customerName: '삼성SDI 천안사업장',
          projectName: 'Battery Cell Manufacturing Intelligence',
          projectOverview: 'Implemented real-time quality inspection using computer vision and digital twin simulation for battery cell production, achieving 99.7% yield rate.',
          projectSize: '$3.1M',
          duration: '12 months',
          industry: 'Manufacturing',
        },
        {
          customerName: 'LG화학 여수공장',
          projectName: 'Predictive Maintenance for Chemical Reactors',
          projectOverview: 'Deployed vibration analysis and thermal imaging AI to predict equipment failures 72 hours in advance, reducing unplanned downtime by 40%.',
          projectSize: '$1.8M',
          duration: '6 months',
          industry: 'Manufacturing',
        },
      ],
    },
    // AX Fraud Detection Suite
    {
      item: 'AX Fraud Detection Suite',
      cases: [
        {
          customerName: '신한은행',
          projectName: 'Real-time Card Fraud Prevention',
          projectOverview: 'Replaced legacy rule-based system with graph neural network model processing 15K transactions/second, reducing fraud losses by $12M annually.',
          projectSize: '$4.2M',
          duration: '10 months',
          industry: 'Finance',
        },
        {
          customerName: 'KB국민카드',
          projectName: 'Merchant Fraud Network Detection',
          projectOverview: 'Built merchant relationship graph to identify organized fraud rings, detecting 340+ fraudulent merchant networks in the first quarter.',
          projectSize: '$2.8M',
          duration: '7 months',
          industry: 'Finance',
        },
      ],
    },
    // AX Citizen Service Portal
    {
      item: 'AX Citizen Service Portal',
      cases: [
        {
          customerName: '행정안전부',
          projectName: 'National Digital Service Integration',
          projectOverview: 'Unified 47 government services into a single portal with AI-powered document processing, reducing average service processing time from 5 days to 4 hours.',
          projectSize: '$8.5M',
          duration: '18 months',
          industry: 'Public Sector',
        },
        {
          customerName: '서울특별시',
          projectName: 'Smart City Citizen Engagement Platform',
          projectOverview: 'Launched mobile-first citizen service platform handling 2M+ monthly interactions with multilingual AI chatbot supporting Korean, English, and Chinese.',
          projectSize: '$5.2M',
          duration: '14 months',
          industry: 'Public Sector',
        },
      ],
    },
    // AX Supply Chain Control Tower
    {
      item: 'AX Supply Chain Control Tower',
      cases: [
        {
          customerName: 'CJ대한통운',
          projectName: 'Nationwide Logistics Visibility Platform',
          projectOverview: 'Implemented end-to-end tracking for 3M+ daily parcels with AI-based delivery time prediction achieving 97% accuracy within 1-hour window.',
          projectSize: '$6.1M',
          duration: '12 months',
          industry: 'Logistics',
        },
        {
          customerName: '포스코인터내셔널',
          projectName: 'Global Raw Material Supply Chain Optimization',
          projectOverview: 'Built multi-tier supply chain visibility across 15 countries with demand forecasting and supplier risk scoring for steel raw materials.',
          projectSize: '$3.7M',
          duration: '9 months',
          industry: 'Logistics',
        },
        {
          customerName: '한진해운 (후속사업)',
          projectName: 'Maritime Container Routing Intelligence',
          projectOverview: 'Developed AI-optimized container routing system reducing transit times by 12% and fuel costs by 8% across Asia-Pacific shipping lanes.',
          projectSize: '$2.5M',
          duration: '6 months',
          industry: 'Logistics',
        },
      ],
    },
    // AX Network Intelligence Platform
    {
      item: 'AX Network Intelligence Platform',
      cases: [
        {
          customerName: 'SK텔레콤',
          projectName: '5G Network Slice Automation',
          projectOverview: 'Automated 5G network slice provisioning and lifecycle management for enterprise customers, reducing slice deployment time from days to minutes.',
          projectSize: '$7.3M',
          duration: '15 months',
          industry: 'Telecom',
        },
      ],
    },
    // AX Kubernetes Service Mesh
    {
      item: 'AX Kubernetes Service Mesh',
      cases: [
        {
          customerName: 'KT Cloud',
          projectName: 'Multi-tenant Service Mesh Platform',
          projectOverview: 'Deployed enterprise service mesh supporting 500+ microservices across 12 Kubernetes clusters with zero-trust network policies.',
          projectSize: '$1.9M',
          duration: '6 months',
          industry: 'Telecom',
        },
        {
          customerName: '네이버 클라우드',
          projectName: 'Cloud-native Migration Enablement',
          projectOverview: 'Enabled gradual monolith-to-microservices migration for 80+ enterprise customers using traffic splitting and canary deployment automation.',
          projectSize: '$2.2M',
          duration: '8 months',
          industry: 'Telecom',
        },
      ],
    },
    // AX DataLake Accelerator
    {
      item: 'AX DataLake Accelerator',
      cases: [
        {
          customerName: '하나금융그룹',
          projectName: 'Unified Financial Data Lakehouse',
          projectOverview: 'Consolidated data from 23 subsidiaries into a single lakehouse, reducing report generation time by 85% and enabling cross-entity analytics.',
          projectSize: '$5.6M',
          duration: '14 months',
          industry: 'Finance',
        },
        {
          customerName: '국민연금공단',
          projectName: 'Pension Analytics Data Platform',
          projectOverview: 'Built petabyte-scale analytics platform processing 30 years of pension data for actuarial modeling and fraud detection.',
          projectSize: '$4.1M',
          duration: '11 months',
          industry: 'Finance',
        },
      ],
    },
    // AX Edge Computing Framework
    {
      item: 'AX Edge Computing Framework',
      cases: [
        {
          customerName: 'SK하이닉스',
          projectName: 'Semiconductor Wafer Inspection at Edge',
          projectOverview: 'Deployed edge AI models for real-time wafer defect classification with 3ms inference latency, processing 10K+ images per minute per fab line.',
          projectSize: '$3.4M',
          duration: '9 months',
          industry: 'Manufacturing',
        },
      ],
    },
    // AX API Gateway Enterprise
    {
      item: 'AX API Gateway Enterprise',
      cases: [
        {
          customerName: '쿠팡',
          projectName: 'E-commerce API Platform Modernization',
          projectOverview: 'Migrated 400+ internal APIs to unified gateway handling 200K RPS during peak sale events with sub-5ms P99 latency.',
          projectSize: '$2.1M',
          duration: '5 months',
          industry: 'Retail',
        },
        {
          customerName: '롯데쇼핑',
          projectName: 'Omnichannel API Monetization Platform',
          projectOverview: 'Built partner API marketplace enabling 150+ third-party integrations with usage-based billing and real-time analytics.',
          projectSize: '$1.7M',
          duration: '7 months',
          industry: 'Retail',
        },
      ],
    },
    // AX MLOps Pipeline
    {
      item: 'AX MLOps Pipeline',
      cases: [
        {
          customerName: '서울아산병원',
          projectName: 'Medical Imaging AI Lifecycle Management',
          projectOverview: 'Established MLOps pipeline for 12 medical imaging AI models with automated retraining, A/B testing, and FDA/MFDS compliance tracking.',
          projectSize: '$3.8M',
          duration: '10 months',
          industry: 'Healthcare',
        },
        {
          customerName: '삼성서울병원',
          projectName: 'Clinical NLP Model Operations',
          projectOverview: 'Deployed Korean medical NLP models for clinical note analysis with continuous learning pipeline processing 50K+ notes daily.',
          projectSize: '$2.6M',
          duration: '8 months',
          industry: 'Healthcare',
        },
      ],
    },
    // AX Cloud Migration Factory
    {
      item: 'AX Cloud Migration Factory',
      cases: [
        {
          customerName: '국방부',
          projectName: 'Defense IT Modernization Program',
          projectOverview: 'Migrated 120+ legacy military applications to government cloud (G-Cloud) with zero downtime, achieving CSAP certification for all workloads.',
          projectSize: '$12.3M',
          duration: '24 months',
          industry: 'Public Sector',
        },
        {
          customerName: '국세청',
          projectName: 'Tax System Cloud Transformation',
          projectOverview: 'Migrated national tax processing system handling 25M+ annual returns to hybrid cloud architecture with 99.99% availability SLA.',
          projectSize: '$9.8M',
          duration: '20 months',
          industry: 'Public Sector',
        },
      ],
    },
    // AX Digital Twin Consulting
    {
      item: 'AX Digital Twin Consulting',
      cases: [
        {
          customerName: '현대중공업',
          projectName: 'Shipyard Digital Twin Initiative',
          projectOverview: 'Created digital twin of Ulsan shipyard covering 4 dry docks and 8 outfitting berths, enabling virtual commissioning and reducing build cycle by 15%.',
          projectSize: '$7.8M',
          duration: '18 months',
          industry: 'Manufacturing',
        },
        {
          customerName: 'POSCO 포항제철소',
          projectName: 'Blast Furnace Digital Twin',
          projectOverview: 'Built physics-informed digital twin of blast furnace operations for process optimization, reducing coke rate by 3% and CO2 emissions by 5%.',
          projectSize: '$4.5M',
          duration: '12 months',
          industry: 'Manufacturing',
        },
      ],
    },
    // AX Data Governance Program
    {
      item: 'AX Data Governance Program',
      cases: [
        {
          customerName: '우리금융그룹',
          projectName: 'Enterprise Data Governance Framework',
          projectOverview: 'Implemented organization-wide data governance covering 15 subsidiaries with automated data lineage, quality scoring, and PIPA compliance.',
          projectSize: '$6.2M',
          duration: '16 months',
          industry: 'Finance',
        },
      ],
    },
    // AX Energy Management System
    {
      item: 'AX Energy Management System',
      cases: [
        {
          customerName: '한국전력공사',
          projectName: 'Smart Grid Energy Optimization',
          projectOverview: 'Deployed AI-based load forecasting and peak shaving across 500+ substations, reducing grid losses by 7% and enabling 15% more renewable integration.',
          projectSize: '$11.2M',
          duration: '22 months',
          industry: 'Energy',
        },
        {
          customerName: 'SK에너지 울산CLX',
          projectName: 'Refinery Energy Efficiency Program',
          projectOverview: 'Implemented real-time energy monitoring and optimization for refinery operations, achieving 12% reduction in energy cost per barrel processed.',
          projectSize: '$3.9M',
          duration: '10 months',
          industry: 'Energy',
        },
      ],
    },
  ];

  let useCaseCount = 0;
  for (const def of useCaseDefs) {
    for (const uc of def.cases) {
      await prisma.useCase.create({
        data: {
          customerName: uc.customerName,
          projectName: uc.projectName,
          projectOverview: uc.projectOverview,
          projectSize: typeof uc.projectSize === 'string'
            ? parseFloat(uc.projectSize.replace(/[$M,]/g, '')) * 1000000
            : uc.projectSize ?? null,
          duration: uc.duration,
          industryId: industries[uc.industry].id,
          catalogItemId: catalogItems[def.item].id,
        },
      });
      useCaseCount++;
    }
  }
  console.log(`  Created ${useCaseCount} use cases.\n`);

  // --- Tech Stack Entries ---
  console.log('Creating tech stack entries...');

  const techStackDefs: Record<string, Array<{ techDomain: string; techCategory: string; techAsset: string }>> = {
    'AX Smart Factory Platform': [
      { techDomain: 'IoT Platform', techCategory: 'Device Management', techAsset: 'AWS IoT Core' },
      { techDomain: 'AI/ML', techCategory: 'Computer Vision', techAsset: 'NVIDIA Triton Inference Server' },
      { techDomain: 'Data Engineering', techCategory: 'Stream Processing', techAsset: 'Apache Kafka' },
      { techDomain: 'Visualization', techCategory: 'Real-time Dashboard', techAsset: 'Grafana' },
    ],
    'AX Fraud Detection Suite': [
      { techDomain: 'AI/ML', techCategory: 'Graph Neural Networks', techAsset: 'PyTorch Geometric' },
      { techDomain: 'Data Engineering', techCategory: 'Stream Processing', techAsset: 'Apache Flink' },
      { techDomain: 'Database', techCategory: 'Graph Database', techAsset: 'Neo4j' },
      { techDomain: 'Cloud Infrastructure', techCategory: 'Container Orchestration', techAsset: 'Kubernetes' },
    ],
    'AX Citizen Service Portal': [
      { techDomain: 'Application Platform', techCategory: 'Low-Code', techAsset: 'OutSystems' },
      { techDomain: 'AI/ML', techCategory: 'NLP', techAsset: 'GPT-4 Fine-tuning' },
      { techDomain: 'Security', techCategory: 'Identity Management', techAsset: 'Keycloak' },
    ],
    'AX Supply Chain Control Tower': [
      { techDomain: 'AI/ML', techCategory: 'Time Series Forecasting', techAsset: 'Amazon Forecast' },
      { techDomain: 'Data Engineering', techCategory: 'ETL Pipeline', techAsset: 'Apache Airflow' },
      { techDomain: 'Cloud Infrastructure', techCategory: 'Serverless', techAsset: 'AWS Lambda' },
      { techDomain: 'Visualization', techCategory: 'Geospatial', techAsset: 'Mapbox GL' },
    ],
    'AX Network Intelligence Platform': [
      { techDomain: 'Cloud Infrastructure', techCategory: 'Network Function Virtualization', techAsset: 'OpenStack' },
      { techDomain: 'AI/ML', techCategory: 'Anomaly Detection', techAsset: 'TensorFlow Extended (TFX)' },
      { techDomain: 'Observability', techCategory: 'Telemetry', techAsset: 'OpenTelemetry' },
    ],
    'AX Kubernetes Service Mesh': [
      { techDomain: 'Cloud Infrastructure', techCategory: 'Service Mesh', techAsset: 'Istio' },
      { techDomain: 'Cloud Infrastructure', techCategory: 'Container Orchestration', techAsset: 'Kubernetes' },
      { techDomain: 'Observability', techCategory: 'Distributed Tracing', techAsset: 'Jaeger' },
      { techDomain: 'Security', techCategory: 'Certificate Management', techAsset: 'cert-manager' },
    ],
    'AX DataLake Accelerator': [
      { techDomain: 'Data Engineering', techCategory: 'Lakehouse', techAsset: 'Delta Lake' },
      { techDomain: 'Data Engineering', techCategory: 'Distributed Computing', techAsset: 'Apache Spark' },
      { techDomain: 'Cloud Infrastructure', techCategory: 'Object Storage', techAsset: 'MinIO' },
      { techDomain: 'Data Engineering', techCategory: 'Data Quality', techAsset: 'Great Expectations' },
    ],
    'AX Edge Computing Framework': [
      { techDomain: 'Edge Computing', techCategory: 'Edge Runtime', techAsset: 'Azure IoT Edge' },
      { techDomain: 'AI/ML', techCategory: 'Model Optimization', techAsset: 'NVIDIA TensorRT' },
      { techDomain: 'IoT Platform', techCategory: 'Protocol Gateway', techAsset: 'Eclipse Mosquitto (MQTT)' },
    ],
    'AX API Gateway Enterprise': [
      { techDomain: 'Application Platform', techCategory: 'API Gateway', techAsset: 'Kong Enterprise' },
      { techDomain: 'Application Platform', techCategory: 'GraphQL', techAsset: 'Apollo Federation' },
      { techDomain: 'Observability', techCategory: 'API Analytics', techAsset: 'Elastic APM' },
    ],
    'AX MLOps Pipeline': [
      { techDomain: 'AI/ML', techCategory: 'ML Pipeline', techAsset: 'Kubeflow Pipelines' },
      { techDomain: 'AI/ML', techCategory: 'Experiment Tracking', techAsset: 'MLflow' },
      { techDomain: 'AI/ML', techCategory: 'Feature Store', techAsset: 'Feast' },
      { techDomain: 'Cloud Infrastructure', techCategory: 'GPU Orchestration', techAsset: 'NVIDIA DGX Cloud' },
    ],
    'AX Cloud Migration Factory': [
      { techDomain: 'Cloud Infrastructure', techCategory: 'Infrastructure as Code', techAsset: 'Terraform' },
      { techDomain: 'DevOps', techCategory: 'CI/CD Pipeline', techAsset: 'GitLab CI/CD' },
      { techDomain: 'Cloud Infrastructure', techCategory: 'Container Registry', techAsset: 'Harbor' },
      { techDomain: 'Observability', techCategory: 'Monitoring', techAsset: 'Prometheus + Grafana' },
    ],
    'AX Digital Twin Consulting': [
      { techDomain: 'Digital Twin', techCategory: '3D Visualization', techAsset: 'Unity Engine' },
      { techDomain: 'IoT Platform', techCategory: 'Sensor Integration', techAsset: 'Azure Digital Twins' },
      { techDomain: 'AI/ML', techCategory: 'Physics-informed ML', techAsset: 'NVIDIA Modulus' },
    ],
    'AX Data Governance Program': [
      { techDomain: 'Data Engineering', techCategory: 'Data Catalog', techAsset: 'Apache Atlas' },
      { techDomain: 'Data Engineering', techCategory: 'Data Lineage', techAsset: 'OpenLineage' },
      { techDomain: 'Security', techCategory: 'Data Privacy', techAsset: 'Privacera' },
    ],
    'AX Energy Management System': [
      { techDomain: 'IoT Platform', techCategory: 'Smart Metering', techAsset: 'Landis+Gyr GridStream' },
      { techDomain: 'AI/ML', techCategory: 'Time Series Forecasting', techAsset: 'Prophet + LightGBM' },
      { techDomain: 'Cloud Infrastructure', techCategory: 'Time Series DB', techAsset: 'InfluxDB' },
      { techDomain: 'Visualization', techCategory: 'ESG Reporting', techAsset: 'Power BI Embedded' },
    ],
  };

  let techStackCount = 0;
  for (const [itemName, entries] of Object.entries(techStackDefs)) {
    for (const entry of entries) {
      await prisma.techStackEntry.create({
        data: {
          techDomain: entry.techDomain,
          techCategory: entry.techCategory,
          techAsset: entry.techAsset,
          catalogItemId: catalogItems[itemName].id,
        },
      });
      techStackCount++;
    }
  }
  console.log(`  Created ${techStackCount} tech stack entries.\n`);

  // --- Favorites ---
  console.log('Creating favorites...');

  const favoriteDefs = [
    { user: admin, item: 'AX Smart Factory Platform' },
    { user: admin, item: 'AX Cloud Migration Factory' },
    { user: admin, item: 'AX Fraud Detection Suite' },
    { user: editor, item: 'AX DataLake Accelerator' },
    { user: editor, item: 'AX Kubernetes Service Mesh' },
    { user: editor, item: 'AX Supply Chain Control Tower' },
    { user: viewer, item: 'AX Citizen Service Portal' },
    { user: viewer, item: 'AX Smart Factory Platform' },
  ];

  for (const fav of favoriteDefs) {
    await prisma.favorite.create({
      data: {
        userId: fav.user.id,
        catalogItemId: catalogItems[fav.item].id,
      },
    });
  }
  console.log(`  Created ${favoriteDefs.length} favorites.\n`);

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
