import type { components } from '#infrastructure/api/retro.generated'

import type { RetroBoardViewModel, RetroMember } from '../RetroBoardPage.types'

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

export const mapRetro = (retro: RetroResponse): RetroBoardViewModel => {
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
