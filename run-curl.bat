curl -v --http1.1 ^
  -H "Accept: text/event-stream" ^
  -H "Cache-Control: no-cache" ^
  -b "authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsbmFtZSI6IlJvaGl0YmFsIiwiZW1haWwiOiJyb2hpdDE5MDAzQGdtYWlsLmNvbSIsImlhdCI6MTczMzA0MTAzMywiZXhwIjoxNzMzMTI3NDMzfQ.fW2CZm25w_FRYvBVlP4vjG3HM_CT5bMhIznYkF3fIUI" ^
  "http://localhost:3000/API/Sample_papers/DeletebyId?id=674c1bd285869335350bb18f"
