import * as React from "react";
import { Alert, AlertDescription } from "./alert";
import { cn } from "../../lib/utils";

// Define our own message interface that matches Ory's structure
interface UiMessage {
  id: number;
  text: string;
  type: string;
  context?: any;
}

interface FlowNode {
  messages?: UiMessage[];
}

interface FlowUI {
  messages?: UiMessage[];
  nodes?: FlowNode[];
}

interface Flow {
  ui: FlowUI;
}

interface MessagesProps {
  flow?: Flow;
  className?: string;
}

const getMessageVariant = (type: string) => {
  switch (type) {
    case "error":
      return "destructive";
    case "success":
      return "success";
    case "info":
      return "info";
    case "11184809": // Unknown type - treating as warning
      return "warning";
    default:
      return "default";
  }
};

const Messages = React.forwardRef<HTMLDivElement, MessagesProps>(
  ({ flow, className, ...props }, ref) => {
    if (!flow?.ui) return null;

    // Collect all messages from flow.ui.messages and flow.ui.nodes[].messages
    const allMessages: UiMessage[] = [];

    // Add messages from flow.ui.messages
    if (flow.ui.messages) {
      allMessages.push(...flow.ui.messages);
    }

    // Add messages from all nodes
    if (flow.ui.nodes) {
      flow.ui.nodes.forEach((node) => {
        if (node.messages) {
          allMessages.push(...node.messages);
        }
      });
    }

    if (allMessages.length === 0) return null;

    return (
      <div
        ref={ref}
        className={cn("w-full max-w-md mx-auto space-y-2 mb-4", className)}
        {...props}
      >
        {allMessages.map((message) => (
          <Alert key={message.id} variant={getMessageVariant(message.type)}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        ))}
      </div>
    );
  }
);

Messages.displayName = "Messages";

export { Messages, type Flow, type UiMessage };
