import type { Story } from "@ladle/react"
import { Diagram } from "./Diagram"

export const DiagramExample: Story = () => (
  <Diagram
    lang="d2"
    source={`
# Network Architecture
api: API Gateway {
  shape: hexagon
}
lambda: Lambda Function {
  shape: oval
}
db: Database {
  shape: cylinder
}

api -> lambda: HTTP Request
lambda -> db: Query
db -> lambda: Result
lambda -> api: Response
    `.trim()}
  />
)
