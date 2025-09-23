"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/store/auth-store"
import { useJobStore } from "@/store/job-store"
import type { Job } from "@/lib/types"
import { FiMapPin, FiBriefcase, FiClock, FiUsers, FiExternalLink } from "react-icons/fi"

interface JobModalProps {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JobModal({ job, open, onOpenChange }: JobModalProps) {
  const [isApplying, setIsApplying] = useState(false)
  const { user } = useAuthStore()
  const { applyToJob, getJobMatches, matches } = useJobStore()

  const isCompany = user?.role === "COMPANY"
  const isOwnJob = job.company?.userId === user?.id

  useEffect(() => {
    if (open && isCompany && isOwnJob) {
      getJobMatches(job.id)
    }
  }, [open, isCompany, isOwnJob, job.id, getJobMatches])

  const handleApply = async () => {
    setIsApplying(true)
    try {
      await applyToJob(job.id)
      // Show success message
      onOpenChange(false)
    } catch (error) {
      console.error("Error applying to job:", error)
    } finally {
      setIsApplying(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "bg-success/10 text-success"
      case "PART_TIME":
        return "bg-warning/10 text-warning"
      case "CONTRACT":
        return "bg-secondary/10 text-secondary"
      case "INTERNSHIP":
        return "bg-primary/10 text-primary"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "Tiempo completo"
      case "PART_TIME":
        return "Medio tiempo"
      case "CONTRACT":
        return "Contrato"
      case "INTERNSHIP":
        return "Prácticas"
      default:
        return type
    }
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Salario a convenir"
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `Desde $${min.toLocaleString()}`
    if (max) return `Hasta $${max.toLocaleString()}`
    return "Salario a convenir"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{job.title}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Company Info */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={job.company?.logo || "/placeholder.svg"} alt={job.company?.name} />
                <AvatarFallback>
                  <FiBriefcase className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{job.company?.name}</h3>
                <p className="text-muted-foreground">{job.company?.industry}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <FiMapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiClock className="h-4 w-4" />
                    <span>
                      {formatDistanceToNow(new Date(job.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Job Description */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Descripción del puesto</h4>
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Requisitos</h4>
                  <ul className="space-y-2">
                    {job.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Skills */}
            {job.skills.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Habilidades requeridas</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Company Matches (for company users) */}
            {isCompany && isOwnJob && matches.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Candidatos recomendados</h4>
                  <div className="space-y-3">
                    {matches.slice(0, 3).map((match) => (
                      <div key={match.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={match.user?.profileImage || "/placeholder.svg"} />
                            <AvatarFallback>
                              {match.user?.firstName?.[0]}
                              {match.user?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {match.user?.firstName} {match.user?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{match.explanation}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{Math.round(match.score * 100)}%</div>
                          <div className="text-xs text-muted-foreground">Match</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Details Card */}
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <h4 className="font-semibold">Detalles del empleo</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tipo</span>
                  <Badge className={`text-xs ${getTypeColor(job.type)}`}>{getTypeText(job.type)}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Salario</span>
                  <span className="text-sm font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ubicación</span>
                  <span className="text-sm font-medium">{job.location}</span>
                </div>

                {job.company?.size && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tamaño</span>
                    <span className="text-sm font-medium">{job.company.size}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {!isCompany ? (
                <Button onClick={handleApply} disabled={isApplying} className="w-full">
                  {isApplying ? "Aplicando..." : "Aplicar a este empleo"}
                </Button>
              ) : isOwnJob ? (
                <Button variant="outline" className="w-full bg-transparent">
                  <FiUsers className="h-4 w-4 mr-2" />
                  Ver todos los candidatos
                </Button>
              ) : null}

              {job.company?.website && (
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <a href={job.company.website} target="_blank" rel="noopener noreferrer">
                    <FiExternalLink className="h-4 w-4 mr-2" />
                    Visitar sitio web
                  </a>
                </Button>
              )}
            </div>

            {/* Company Info */}
            {job.company && (
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <h4 className="font-semibold">Sobre la empresa</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{job.company.description}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
