;; Risk Assessment Contract
;; Assesses and manages portfolio risks

(define-constant ERR_UNAUTHORIZED (err u400))
(define-constant ERR_INVALID_RISK_LEVEL (err u401))
(define-constant ERR_PROJECT_NOT_FOUND (err u402))

;; Risk levels: 1-5 (Low to Critical)
(define-map project-risks uint {
  technical-risk: uint,
  financial-risk: uint,
  timeline-risk: uint,
  resource-risk: uint,
  overall-risk: uint,
  assessed-at: uint,
  assessor: principal
})

(define-map risk-mitigation uint (list 5 (string-ascii 200)))

;; Public functions
(define-public (assess-project-risk
  (project-id uint)
  (technical uint)
  (financial uint)
  (timeline uint)
  (resource uint))
  (begin
    (asserts! (and (<= technical u5) (>= technical u1)) ERR_INVALID_RISK_LEVEL)
    (asserts! (and (<= financial u5) (>= financial u1)) ERR_INVALID_RISK_LEVEL)
    (asserts! (and (<= timeline u5) (>= timeline u1)) ERR_INVALID_RISK_LEVEL)
    (asserts! (and (<= resource u5) (>= resource u1)) ERR_INVALID_RISK_LEVEL)

    (let ((overall (calculate-overall-risk technical financial timeline resource)))
      (map-set project-risks project-id {
        technical-risk: technical,
        financial-risk: financial,
        timeline-risk: timeline,
        resource-risk: resource,
        overall-risk: overall,
        assessed-at: block-height,
        assessor: tx-sender
      })
      (ok overall)
    )
  )
)

(define-public (add-risk-mitigation (project-id uint) (mitigation (string-ascii 200)))
  (let ((current-mitigations (default-to (list) (map-get? risk-mitigation project-id))))
    (begin
      (map-set risk-mitigation project-id (unwrap! (as-max-len? (append current-mitigations mitigation) u5) ERR_INVALID_RISK_LEVEL))
      (ok true)
    )
  )
)

;; Private functions
(define-private (calculate-overall-risk (technical uint) (financial uint) (timeline uint) (resource uint))
  ;; Weighted average: technical=30%, financial=25%, timeline=25%, resource=20%
  (/ (+ (* technical u30) (* financial u25) (* timeline u25) (* resource u20)) u100)
)

;; Read-only functions
(define-read-only (get-project-risk (project-id uint))
  (map-get? project-risks project-id)
)

(define-read-only (get-risk-mitigations (project-id uint))
  (map-get? risk-mitigation project-id)
)

(define-read-only (get-portfolio-risk-summary)
  ;; This would typically aggregate all project risks
  ;; Simplified version returns a basic summary
  (ok {total-projects: u0, high-risk-projects: u0, average-risk: u0})
)
