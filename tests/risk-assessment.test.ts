import { describe, it, expect, beforeEach } from 'vitest'

let projectRisks
let riskMitigations

describe('Risk Assessment Contract', () => {
  beforeEach(() => {
    projectRisks = new Map()
    riskMitigations = new Map()
  })
  
  describe('Risk Assessment', () => {
    it('should assess project risk successfully', () => {
      const riskData = {
        technical: 3,
        financial: 2,
        timeline: 4,
        resource: 3
      }
      
      const result = assessProjectRisk(1, riskData)
      
      expect(result.success).toBe(true)
      expect(result.overallRisk).toBeGreaterThan(0)
      expect(result.overallRisk).toBeLessThanOrEqual(5)
    })
    
    it('should reject invalid risk levels', () => {
      const invalidRiskData = {
        technical: 6, // Invalid - over 5
        financial: 2,
        timeline: 4,
        resource: 3
      }
      
      const result = assessProjectRisk(1, invalidRiskData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('ERR_INVALID_RISK_LEVEL')
    })
    
    it('should reject zero risk levels', () => {
      const invalidRiskData = {
        technical: 0, // Invalid - under 1
        financial: 2,
        timeline: 4,
        resource: 3
      }
      
      const result = assessProjectRisk(1, invalidRiskData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('ERR_INVALID_RISK_LEVEL')
    })
  })
  
  describe('Risk Calculation', () => {
    it('should calculate overall risk correctly', () => {
      const technical = 4
      const financial = 3
      const timeline = 2
      const resource = 5
      
      // Weighted average: technical=30%, financial=25%, timeline=25%, resource=20%
      const expectedRisk = Math.floor((technical * 30 + financial * 25 + timeline * 25 + resource * 20) / 100)
      const calculatedRisk = calculateOverallRisk(technical, financial, timeline, resource)
      
      expect(calculatedRisk).toBe(expectedRisk)
    })
    
    it('should handle minimum risk levels', () => {
      const overallRisk = calculateOverallRisk(1, 1, 1, 1)
      
      expect(overallRisk).toBe(1)
    })
    
    it('should handle maximum risk levels', () => {
      const overallRisk = calculateOverallRisk(5, 5, 5, 5)
      
      expect(overallRisk).toBe(5)
    })
  })
  
  describe('Risk Mitigation', () => {
    it('should add risk mitigation successfully', () => {
      const mitigation = 'Implement automated testing to reduce technical risk'
      const result = addRiskMitigation(1, mitigation)
      
      expect(result.success).toBe(true)
      
      const mitigations = getRiskMitigations(1)
      expect(mitigations).toContain(mitigation)
    })
    
    it('should handle multiple mitigations', () => {
      const mitigations = [
        'Implement automated testing',
        'Add budget buffer for contingencies',
        'Create detailed project timeline'
      ]
      
      mitigations.forEach(mitigation => {
        const result = addRiskMitigation(1, mitigation)
        expect(result.success).toBe(true)
      })
      
      const projectMitigations = getRiskMitigations(1)
      expect(projectMitigations).toHaveLength(3)
      mitigations.forEach(mitigation => {
        expect(projectMitigations).toContain(mitigation)
      })
    })
    
    it('should limit mitigation count', () => {
      // Add maximum allowed mitigations (5)
      for (let i = 1; i <= 5; i++) {
        const result = addRiskMitigation(1, `Mitigation ${i}`)
        expect(result.success).toBe(true)
      }
      
      // Try to add one more (should fail)
      const result = addRiskMitigation(1, 'Mitigation 6')
      expect(result.success).toBe(false)
      expect(result.error).toBe('ERR_INVALID_RISK_LEVEL')
    })
  })
  
  describe('Risk Queries', () => {
    it('should retrieve project risk assessment', () => {
      const riskData = {
        technical: 3,
        financial: 2,
        timeline: 4,
        resource: 3
      }
      
      assessProjectRisk(1, riskData)
      const retrievedRisk = getProjectRisk(1)
      
      expect(retrievedRisk).toBeDefined()
      expect(retrievedRisk.technical).toBe(3)
      expect(retrievedRisk.financial).toBe(2)
      expect(retrievedRisk.timeline).toBe(4)
      expect(retrievedRisk.resource).toBe(3)
    })
    
    it('should return null for non-assessed project', () => {
      const risk = getProjectRisk(999)
      
      expect(risk).toBeNull()
    })
    
    it('should retrieve risk mitigations', () => {
      addRiskMitigation(1, 'Test mitigation')
      const mitigations = getRiskMitigations(1)
      
      expect(mitigations).toContain('Test mitigation')
    })
  })
  
  describe('Portfolio Risk Summary', () => {
    it('should generate portfolio risk summary', () => {
      // Assess multiple projects
      assessProjectRisk(1, { technical: 3, financial: 2, timeline: 4, resource: 3 })
      assessProjectRisk(2, { technical: 5, financial: 4, timeline: 3, resource: 4 })
      assessProjectRisk(3, { technical: 2, financial: 1, timeline: 2, resource: 2 })
      
      const summary = getPortfolioRiskSummary()
      
      expect(summary.success).toBe(true)
      expect(summary.totalProjects).toBeGreaterThan(0)
    })
  })
})

// Helper functions for testing
function assessProjectRisk(projectId, riskData) {
  const { technical, financial, timeline, resource } = riskData
  
  // Validate risk levels
  if (technical < 1 || technical > 5 ||
      financial < 1 || financial > 5 ||
      timeline < 1 || timeline > 5 ||
      resource < 1 || resource > 5) {
    return { success: false, error: 'ERR_INVALID_RISK_LEVEL' }
  }
  
  const overallRisk = calculateOverallRisk(technical, financial, timeline, resource)
  
  const riskAssessment = {
    technical,
    financial,
    timeline,
    resource,
    overallRisk,
    assessedAt: Date.now(),
    assessor: 'test-user'
  }
  
  projectRisks.set(projectId, riskAssessment)
  
  return {
    success: true,
    overallRisk
  }
}

function calculateOverallRisk(technical, financial, timeline, resource) {
  // Weighted average: technical=30%, financial=25%, timeline=25%, resource=20%
  return Math.floor((technical * 30 + financial * 25 + timeline * 25 + resource * 20) / 100)
}

function addRiskMitigation(projectId, mitigation) {
  const currentMitigations = riskMitigations.get(projectId) || []
  
  if (currentMitigations.length >= 5) {
    return { success: false, error: 'ERR_INVALID_RISK_LEVEL' }
  }
  
  currentMitigations.push(mitigation)
  riskMitigations.set(projectId, currentMitigations)
  
  return { success: true }
}

function getProjectRisk(projectId) {
  return projectRisks.get(projectId) || null
}

function getRiskMitigations(projectId) {
  return riskMitigations.get(projectId) || []
}

function getPortfolioRiskSummary() {
  const totalProjects = projectRisks.size
  let highRiskProjects = 0
  let totalRisk = 0
  
  for (const [projectId, risk] of projectRisks) {
    if (risk.overallRisk >= 4) {
      highRiskProjects++
    }
    totalRisk += risk.overallRisk
  }
  
  const averageRisk = totalProjects > 0 ? Math.floor(totalRisk / totalProjects) : 0
  
  return {
    success: true,
    totalProjects,
    highRiskProjects,
    averageRisk
  }
}
