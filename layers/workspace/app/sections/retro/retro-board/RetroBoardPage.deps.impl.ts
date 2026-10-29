import type { RetroApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import type { components } from '#infrastructure/api/retro.generated'
import { createRetroChannel } from '#infrastructure/realtime/retroChannel'

import type { RetroBoardPageDeps, RetroBoardViewModel, RetroMember } from './RetroBoardPage.deps'

type RetroResponse = components['schemas']['GetRetroResponse']

const toMember = (member: {
  color: string
  displayName: string
  initials: string
  userId: string
}) => ({
  color: member.color,
  initials: member.initials,
  name: member.displayName,
  userId: member.userId,
})

const mapRetro = (retro: RetroResponse): RetroBoardViewModel => {
  const cards = retro.cards.map((card) => ({
    assignee: card.assignee ? toMember(card.assignee) : null,
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
    groups: retro.groups.map((group) => ({
      cardIds: group.cardIds.map(String),
      id: String(group.id),
      title: group.title,
      votedByMe: group.votedByMe,
      votes: Number(group.votes),
    })),
    id: String(retro.id),
    me: toMember(retro.currentUser),
    myVotes: Number(retro.myVotes),
    name: retro.name,
    owner: toMember(retro.owner),
    participants: retro.participants.map((participant): RetroMember => toMember(participant)),
    phase: retro.phase,
    phaseEndsAt: retro.phaseEndsAt,
    sections: retro.sections
      .toSorted((left, right) => Number(left.sortOrder) - Number(right.sortOrder))
      .map((section) => ({
        color: section.color,
        id: String(section.id),
        name: section.name,
      })),
    votesPerUser: Number(retro.votesPerUser),
  }
}

export const createRetroBoardPageDeps = (
  client: RetroApiClient,
  retroHubUrl: string,
): RetroBoardPageDeps => ({
  advancePhase: async ({ phase, retroId }) => {
    await request(
      client.POST('/api/retro/{id}/phase/next', {
        body: { phase },
        params: { path: { id: Number(retroId) } },
      }),
    )
  },
  createCard: async ({ retroId, sectionId, text, x, y }) => {
    const created = await request(
      client.POST('/api/retro/{id}/cards', {
        body: { sectionId: Number(sectionId), text, x, y },
        params: { path: { id: Number(retroId) } },
      }),
    )
    return created.id
  },
  createChannel: (retroId) => {
    const channel = createRetroChannel(retroHubUrl, retroId)
    return {
      ...channel,
      sync: () => channel.sync<RetroResponse>().then(mapRetro),
    }
  },
  finishRetro: async ({ retroId }) => {
    await request(
      client.POST('/api/retro/{id}/finish', { params: { path: { id: Number(retroId) } } }),
    )
  },
  groupCards: async ({ cards, retroId }) => {
    const created = await request(
      client.POST('/api/retro/{id}/groups', {
        body: { cards },
        params: { path: { id: Number(retroId) } },
      }),
    )
    return String(created.id)
  },
  moveCard: async ({ groupId, id, sectionId, x, y }) => {
    await request(
      client.PUT('/api/retro/cards/{cardId}/position', {
        body: {
          groupId: groupId === null ? null : Number(groupId),
          sectionId: Number(sectionId),
          x,
          y,
        },
        params: { path: { cardId: id } },
      }),
    )
  },
  moveGroup: async ({ deltaX, deltaY, groupId, retroId, sectionId }) => {
    await request(
      client.PUT('/api/retro/{id}/groups/{groupId}/position', {
        body: { deltaX, deltaY, sectionId: Number(sectionId) },
        params: { path: { groupId: Number(groupId), id: Number(retroId) } },
      }),
    )
  },
  removeCard: async ({ id }) => {
    await request(client.DELETE('/api/retro/cards/{cardId}', { params: { path: { cardId: id } } }))
  },
  renameRetro: async ({ name, retroId }) => {
    await request(
      client.PUT('/api/retro/{id}/name', {
        body: { name },
        params: { path: { id: Number(retroId) } },
      }),
    )
  },
  resetVotes: async ({ retroId }) => {
    await request(
      client.DELETE('/api/retro/{id}/votes', { params: { path: { id: Number(retroId) } } }),
    )
  },
  revertPhase: async ({ phase, retroId }) => {
    await request(
      client.POST('/api/retro/{id}/phase/back', {
        body: { phase },
        params: { path: { id: Number(retroId) } },
      }),
    )
  },
  setCardAssignee: async ({ assigneeId, id }) => {
    await request(
      client.POST('/api/retro/cards/{cardId}/assignee', {
        body: { assigneeId },
        params: { path: { cardId: id } },
      }),
    )
  },
  setGroupTitle: async ({ groupId, retroId, title }) => {
    await request(
      client.PUT('/api/retro/{id}/groups/{groupId}', {
        body: { title },
        params: { path: { groupId: Number(groupId), id: Number(retroId) } },
      }),
    )
  },
  setMyCardsRevealed: async ({ retroId, revealed }) => {
    await request(
      client.POST('/api/retro/{id}/reveal-mine', {
        body: { revealed },
        params: { path: { id: Number(retroId) } },
      }),
    )
  },
  setPhaseTimer: async ({ minutes, retroId }) => {
    await request(
      client.POST('/api/retro/{id}/timer', {
        body: { minutes },
        params: { path: { id: Number(retroId) } },
      }),
    )
  },
  toggleDone: async ({ done, id }) => {
    await request(
      client.POST('/api/retro/cards/{cardId}/done', {
        body: { done },
        params: { path: { cardId: id } },
      }),
    )
  },
  toggleReveal: async ({ id, revealed }) => {
    await request(
      client.POST('/api/retro/cards/{cardId}/reveal', {
        body: { revealed },
        params: { path: { cardId: id } },
      }),
    )
  },
  toggleVote: async ({ id, voted }) => {
    await request(
      client.POST('/api/retro/cards/{cardId}/vote', {
        body: { voted },
        params: { path: { cardId: id } },
      }),
    )
  },
  transferOwnership: async ({ retroId, userId }) => {
    await request(
      client.POST('/api/retro/{id}/owner', {
        body: { userId },
        params: { path: { id: Number(retroId) } },
      }),
    )
  },
  ungroup: async ({ groupId, retroId }) => {
    await request(
      client.DELETE('/api/retro/{id}/groups/{groupId}', {
        params: { path: { groupId: Number(groupId), id: Number(retroId) } },
      }),
    )
  },
  updateCard: async ({ id, text }) => {
    await request(
      client.PUT('/api/retro/cards/{cardId}', { body: { text }, params: { path: { cardId: id } } }),
    )
  },
  updateSettings: async ({ phase, retroId, votesPerUser }) => {
    await request(
      client.POST('/api/retro/{id}/settings', {
        body: { phase, votesPerUser },
        params: { path: { id: Number(retroId) } },
      }),
    )
  },
  view: async ({ retroId, signal }) =>
    mapRetro(
      await request(
        client.GET('/api/retro/{id}', { params: { path: { id: Number(retroId) } }, signal }),
      ),
    ),
})
