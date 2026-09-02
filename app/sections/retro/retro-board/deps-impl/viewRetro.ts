import type { RetroApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { RetroBoardPageDeps } from '../RetroBoardPage.deps'
import type { RetroMember } from '../RetroBoardPage.types'

export const createViewRetro =
  (client: RetroApiClient): RetroBoardPageDeps['view'] =>
  ({ retroId, signal }) =>
    executeQuery({
      map: (retro) => {
        if (!retro) {
          return undefined
        }
        const mine = retro.cards.filter((card) => card.isMine)
        const sections = retro.sections
          .toSorted((left, right) => Number(left.sortOrder) - Number(right.sortOrder))
          .map((section) => ({
            color: section.color,
            id: String(section.id),
            name: section.name,
          }))
        const groups = retro.groups.map((group) => ({
          cardIds: group.cardIds,
          id: String(group.id),
          title: group.title,
          votedByMe: group.votedByMe,
          votes: Number(group.votes),
        }))
        const cards = retro.cards.map((card) => ({
          assignee: card.assignee
            ? {
                color: card.assignee.color,
                initials: card.assignee.initials,
                name: card.assignee.displayName,
                userId: card.assignee.userId,
              }
            : null,
          authorColor: card.author.color,
          authorInitials: card.author.initials,
          authorName: card.author.displayName,
          done: card.done,
          groupId: card.groupId === null ? null : String(card.groupId),
          hidden: card.hidden,
          id: card.id,
          isMine: card.isMine,
          revealed: card.revealed,
          sectionId: String(card.sectionId),
          text: card.text,
          votedByMe: card.votedByMe,
          votes: Number(card.votes),
          x: Number(card.x),
          y: Number(card.y),
        }))

        return {
          canManage: retro.canManage,
          cards,
          color: retro.color,
          finished: retro.finishedAt !== null,
          groups,
          hiddenMine: mine.filter((card) => !card.revealed).length,
          id: String(retro.id),
          me: {
            color: retro.currentUser.color,
            initials: retro.currentUser.initials,
            name: retro.currentUser.displayName,
            userId: retro.currentUser.userId,
          },
          myVotes: Number(retro.myVotes),
          name: retro.name,
          owner: {
            color: retro.owner.color,
            initials: retro.owner.initials,
            name: retro.owner.displayName,
            userId: retro.owner.userId,
          },
          participants: retro.participants.map(
            (participant): RetroMember => ({
              color: participant.color,
              initials: participant.initials,
              name: participant.displayName,
              userId: participant.userId,
            }),
          ),
          phase: retro.phase,
          phaseEndsAt: retro.phaseEndsAt,
          revealedMine: mine.filter((card) => card.revealed).length,
          sections,
          votesPerUser: Number(retro.votesPerUser),
        }
      },
      request: () =>
        client.GET('/api/retro/{id}', { params: { path: { id: Number(retroId) } }, signal }),
    })
