
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000
const NOTIFICATION_PERMISSION_KEY = 'filmplex_notification_permission_status';

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

type NotificationPermission = 'default' | 'granted' | 'denied';

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
  SET_NOTIFICATION_PERMISSION: "SET_NOTIFICATION_PERMISSION",
  TRIGGER_PERMISSION_PROMPT: "TRIGGER_PERMISSION_PROMPT",
  HIDE_PERMISSION_PROMPT: "HIDE_PERMISSION_PROMPT",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["SET_NOTIFICATION_PERMISSION"],
      permission: NotificationPermission
    }
  | {
      type: ActionType["TRIGGER_PERMISSION_PROMPT"]
    }
  | {
      type: ActionType["HIDE_PERMISSION_PROMPT"]
    }


interface State {
  toasts: ToasterToast[];
  notificationPermission: NotificationPermission;
  isPermissionPromptVisible: boolean;
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    
    case "SET_NOTIFICATION_PERMISSION":
      if (typeof window !== "undefined") {
        localStorage.setItem(NOTIFICATION_PERMISSION_KEY, action.permission);
      }
      return {
        ...state,
        notificationPermission: action.permission
      }
    
    case "TRIGGER_PERMISSION_PROMPT":
      return { ...state, isPermissionPromptVisible: true }
      
    case "HIDE_PERMISSION_PROMPT":
      return { ...state, isPermissionPromptVisible: false }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { 
  toasts: [],
  notificationPermission: 'default',
  isPermissionPromptVisible: false,
};

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    // This effect runs only on the client, safely accessing localStorage.
    const savedPermission = localStorage.getItem(NOTIFICATION_PERMISSION_KEY) as NotificationPermission | null;
    if (savedPermission && savedPermission !== memoryState.notificationPermission) {
      dispatch({ type: "SET_NOTIFICATION_PERMISSION", permission: savedPermission });
    }

    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    setNotificationPermission: (permission: NotificationPermission) => dispatch({ type: "SET_NOTIFICATION_PERMISSION", permission }),
    hidePermissionPrompt: () => dispatch({ type: "HIDE_PERMISSION_PROMPT" }),
    triggerPermissionPrompt: () => dispatch({ type: "TRIGGER_PERMISSION_PROMPT" }),
  }
}

export { useToast, toast }
